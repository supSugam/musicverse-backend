import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';

export class TrackBasePaginationDto extends BasePaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  creator?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  genre?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  tags?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  albums?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  likedBy?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  playlists?: boolean;
}
