import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
  Response,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Get()
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

  @Get(':id')
  @ApiCreatedResponse({ type: UserEntity, description: 'Get a user by Id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: UserEntity, description: 'Update a user by Id' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiCreatedResponse({ description: 'Delete a user by Id' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // TODO: Profile Routes
}
