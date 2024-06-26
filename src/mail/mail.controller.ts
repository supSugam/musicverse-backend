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
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
@ApiTags('auth/mail-service')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly prismaService: PrismaService
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
      await this.prismaService.user.update({
        where: { email: verifyOtpDto.email },
        data: { isVerified: true },
      });
      return { message: 'OTP Verification Successful.' };
    } else {
      throw new UnauthorizedException('Invalid OTP, Please try again.');
    }
  }
}
