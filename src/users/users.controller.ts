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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRoles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UserRoles(Role.ADMIN)
  async findAll() {
    return await this.usersService.findAll();
  }

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

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiCreatedResponse({ description: 'Delete a user by Id' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post('/toggle-follow/:userId')
  @ApiCreatedResponse({ description: 'Toggle follow user by Id' })
  async toggleFollow(@Request() req, @Param('userId') userId: string) {
    return this.usersService.toggleFollow(req['user'].id, userId);
  }

  // TODO: Profile Routes
}
