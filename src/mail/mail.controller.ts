import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';

@Controller('auth')
@ApiTags('auth/mail-service')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-otp')
  @ApiCreatedResponse({ description: 'Send OTP as mail' })
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    sendOtpDto: SendOtpDto
  ) {
    return this.mailService.sendOtpAsMail(sendOtpDto);
  }
}
