// src/auth/dto/register-user.dto.ts
import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsArray,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({
    message: 'Username is required.',
  })
  @IsString()
  username: string;

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

  @IsNotEmpty({
    message: 'Password is required.',
  })
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least 1 uppercase, 1 lowercase, and 1 number.',
  })
  password: string;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: string;

  @IsArray()
  @IsOptional()
  genreIds?: Array<string>;
}
