// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from 'src/mail/dto/reset-password-dto';
import { AuthGuard } from './auth.guard';

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

  @Post('refresh-token')
  @UseGuards(AuthGuard)
  async refresh(@Request() req) {
    return await this.authService.refresh(req);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
  @Post('initiate-reset-password/:email')
  async initiateResetPassword(@Param('email') email: string) {
    return await this.authService.initiatePasswordChange(email);
  }
}
