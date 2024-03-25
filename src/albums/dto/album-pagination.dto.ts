import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';

export class AlbumPaginationDto extends BasePaginationDto {
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
  tracks?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  savedBy?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  owned?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  saved?: boolean;
}
