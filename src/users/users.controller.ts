import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRoles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { PaginationService } from 'src/pagination/pagination.service';
import { UsersPaginationQueryParams } from './users-pagination.decorator';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';
import { BasePaginationQueryParams } from 'src/pagination/dto/pagination.decorator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly paginationService: PaginationService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @UsersPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: UserPaginationDto
  ) {
    const { role, artistStatus, isVerified, sortByPopularity, ...rest } =
      params;
    const res = await this.paginationService.paginate({
      modelName: 'User',
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        artistStatus: true,
        profile: true,
        isVerified: true,
        bannedUsers: {
          select: {
            id: true,
            reason: true,
            createdAt: true,
          },
        },
        _count: true,
      },
      where: {
        ...(role && { role }),
        ...(artistStatus && { artistStatus }),
        ...(isVerified !== undefined && { isVerified }),
        NOT: { role: Role.ADMIN },
      },
      ...(sortByPopularity && {
        orderBy: {
          followers: {
            _count: 'desc',
          },
        },
      }),
      ...rest,
    });

    res.items = res.items.map((item) => {
      if (item.bannedUsers.length) {
        item['isBanned'] = true;
      }
      delete item.bannedUsers;
      return item;
    });
    return res;
  }

  @Post('/search')
  @Get('/current-user')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ type: UserEntity, description: 'Get current user' })
  async getCurrentUser(@Request() request: Request) {
    return {
      user: request['user'],
    };
  }

  @Get(':userIdOrUsername')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Get a user by Id or Username' })
  async findOneById(
    @Request() req,
    @Param('userIdOrUsername') userIdOrUsername: string
  ) {
    return this.usersService.findOneByUserIdOrUsername(
      userIdOrUsername,
      req['user'].id
    );
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ type: UserEntity, description: 'Update a user by Id' })
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req['user'].id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ADMIN)
  @ApiCreatedResponse({ type: UserEntity, description: 'Update a user by Id' })
  updateUserById(
    @Param('id') id: string,
    @Body('artistStatus') artistStatus: ReviewStatus
  ) {
    return this.usersService.updateArtistStatus(id, artistStatus);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiCreatedResponse({ description: 'Delete a user by Id' })
  async remove(@Request() req, @Param('id') id: string) {
    return await this.usersService.remove(id, req['user'].id);
  }

  @Post('/toggle-ban/:id')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ADMIN)
  @ApiCreatedResponse({ description: 'Ban a user by Id' })
  async banUser(@Param('id') id: string, @Body('reason') reason?: string) {
    return await this.usersService.toggleBanUser(id, reason);
  }

  @UseGuards(AuthGuard)
  @Post('/toggle-follow/:userId')
  @ApiCreatedResponse({ description: 'Toggle follow user by Id' })
  async toggleFollow(@Request() req, @Param('userId') userId: string) {
    return this.usersService.toggleFollow(req['user'].id, userId);
  }

  @UseGuards(AuthGuard)
  @Post('/register-device/:deviceToken')
  @ApiCreatedResponse({ description: 'Register device token' })
  async registerDeviceToken(
    @Request() req,
    @Param('deviceToken') deviceToken: string
  ) {
    return this.usersService.registerDeviceToken(req['user'].id, deviceToken);
  }

  @UseGuards(AuthGuard)
  @Post('/derigister-device/:deviceToken')
  @ApiCreatedResponse({ description: 'Deregister device token' })
  async deregisterDeviceToken(
    @Request() req,
    @Param('deviceToken') deviceToken: string
  ) {
    return this.usersService.deregisterDeviceToken(req['user'].id, deviceToken);
  }

  // TODO: Profile Routes

  @Get('following/:userId')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Get followings by user Id' })
  async getFollowings(
    @BasePaginationQueryParams() params: BasePaginationDto,
    @Request() req,
    @Param('userId') userId: string
  ) {
    const res = await this.paginationService.paginate({
      modelName: 'User',
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        artistStatus: true,
        profile: true,
        isVerified: true,
        bannedUsers: {
          select: {
            id: true,
            reason: true,
            createdAt: true,
          },
        },
        _count: true,
      },
      where: {
        followers: {
          some: {
            followerId: userId,
          },
        },
      },
      ...params,
    });

    res.items = await Promise.all(
      res.items.map(async (item) => {
        if (item.bannedUsers.length) {
          item['isBanned'] = true;
        }
        item['isFollowing'] = await this.usersService.doesFollow(
          req['user'].id,
          item.id
        );
        item['isFollower'] = await this.usersService.doesFollow(
          item.id,
          req['user'].id
        );
        item['isMe'] = item.id === req['user'].id;
        delete item.bannedUsers;
        return item;
      })
    );

    return res;
  }
  @Get('followers/:userId')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Get followers by user Id' })
  async getFollowers(
    @BasePaginationQueryParams() params: BasePaginationDto,
    @Request() req,
    @Param('userId') userId: string
  ) {
    const res = await this.paginationService.paginate({
      modelName: 'User',
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        artistStatus: true,
        profile: true,
        isVerified: true,
        bannedUsers: {
          select: {
            id: true,
            reason: true,
            createdAt: true,
          },
        },
        _count: true,
      },
      where: {
        following: {
          some: {
            followingId: userId,
          },
        },
      },
      ...params,
    });
    console.log(res);

    res.items = await Promise.all(
      res.items.map(async (item) => {
        if (item.bannedUsers.length) {
          item['isBanned'] = true;
        }
        item['isFollowing'] = await this.usersService.doesFollow(
          req['user'].id,
          item.id
        );
        item['isFollower'] = await this.usersService.doesFollow(
          item.id,
          req['user'].id
        );
        item['isMe'] = item.id === req['user'].id;
        delete item.bannedUsers;
        return item;
      })
    );

    console.log(res);

    return res;
  }

  @Post('purchase-membership')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Purchase membership' })
  async purchaseMembership(@Request() req) {
    return await this.usersService.purchaseMembership(req['user'].id);
  }

  @Post('apply-artist')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Apply artist' })
  async applyArtist(@Request() req) {
    return await this.usersService.applyArtist(req['user'].id);
  }
}
