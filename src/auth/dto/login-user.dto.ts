import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { CredentialsType } from 'src/utils/enums/Auth';

export class LoginUserDto {
  @ApiProperty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsEnum(CredentialsType)
  credentialsType: CredentialsType;
}
