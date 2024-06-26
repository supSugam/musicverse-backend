import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';

export class TrackPaginationDto extends BasePaginationDto {
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
  liked?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  owned?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  playlists?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  selectedGenre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  selectedTag?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  creatorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  publicStatus?: ReviewStatus;
}
