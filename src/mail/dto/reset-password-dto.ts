import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  // @ApiProperty()
  // @IsNumber(
  //   {},
  //   {
  //     message: 'OTP must be purely numeric.',
  //   }
  // )
  // otp: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
