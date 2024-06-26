import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty()
  @IsString({
    message: 'Name must be a string.',
  })
  name: string;

  @ApiProperty()
  @IsOptional()
  bio?: string;
}
