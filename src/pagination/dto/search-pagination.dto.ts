import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';

export class SearchPaginationDto extends BasePaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['all', 'tracks', 'albums', 'playlists', 'users', 'genres', 'tags'])
  type?: string = 'all';
}
