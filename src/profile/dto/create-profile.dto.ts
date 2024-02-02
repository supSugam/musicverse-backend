import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsOptional()
  bio?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  cover?: Express.Multer.File;
}
