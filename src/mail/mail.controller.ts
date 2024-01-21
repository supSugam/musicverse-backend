import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
@ApiTags('auth/mail-service')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService
  ) {}

  @Post('resend-otp')
  @ApiCreatedResponse({ description: 'Send OTP as mail' })
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    sendOtpDto: SendOtpDto
  ) {
    return this.mailService.sendResendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  @ApiCreatedResponse({ description: 'Verify OTP' })
  async verify(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    verifyOtpDto: VerifyOtpDto
  ) {
    const res = await this.mailService.verifyOtp(verifyOtpDto);
    if (res) {
      await this.usersService.updateVerifiedStatus(verifyOtpDto.email, true);
      return { message: 'OTP Verification Successful.' };
    } else {
      // throw unauthorized exception
      throw new UnauthorizedException('Invalid OTP, Please try again.');
    }
  }
}
