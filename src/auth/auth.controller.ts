// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: UserEntity })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    registerUserDto: RegisterUserDto
  ): Promise<UserEntity> {
    return this.authService.create(registerUserDto);
  }

  @Post('login')
  signIn(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    credentials: LoginUserDto
  ) {
    return this.authService.signIn(credentials);
  }
}
