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

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly paginationService: PaginationService
  ) {}

  @Get()
  @UserRoles(Role.ADMIN)
  async findAll(
    @UsersPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: UserPaginationDto
  ) {
    const { role, artistStatus, isVerified, ...rest } = params;
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
      },
      where: {
        ...(role && { role }),
        ...(artistStatus && { artistStatus }),
        ...(isVerified !== undefined && { isVerified }),
        NOT: { role: Role.ADMIN },
      },

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
  @ApiCreatedResponse({ description: 'Get a user by Id or Username' })
  async findOneById(@Param('userIdOrUsername') userIdOrUsername: string) {
    return this.usersService.findOneByUserIdOrUsername(userIdOrUsername);
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
}
