import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Rock', description: 'Name of the tag' })
  @IsString({
    message: 'Name must be a string',
  })
  name: string;
}
