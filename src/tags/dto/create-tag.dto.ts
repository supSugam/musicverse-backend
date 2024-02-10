import { IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @IsString({
    message: 'Name must be a string',
  })
  name: string;
}
