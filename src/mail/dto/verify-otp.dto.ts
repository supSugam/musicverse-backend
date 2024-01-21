import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty()
  @IsEmail(
    {
      allow_display_name: true,
      require_display_name: false,
      allow_utf8_local_part: true,
      require_tld: true,
    },
    {
      message: 'Please provide a valid email address.',
    }
  )
  email: string;

  @ApiProperty()
  @IsNumber(
    {},
    {
      message: 'OTP must be purely numeric.',
    }
  )
  otp: number;
}
