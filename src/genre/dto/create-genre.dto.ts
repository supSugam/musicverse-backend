import { IsOptional, IsString } from 'class-validator';

export class CreateGenreDto {
  @IsString({
    message: 'Name must be a string',
  })
  name: string;

  @IsString({
    message: 'Description must be a string',
  })
  @IsOptional()
  description?: string;
}
