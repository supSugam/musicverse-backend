import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';

export class PlaylistPaginationDto extends BasePaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  creator?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  tags?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  tracks?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  savedBy?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  collaborators?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  containsTrack?: string;

  //   @ApiProperty({ required: false })
  //   @IsOptional()
  //   selectedGenre?: string;

  //   @ApiProperty({ required: false })
  //   @IsOptional()
  //   selectedTag?: string;
}
