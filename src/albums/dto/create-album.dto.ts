import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class CreateAlbumDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  cover?: string;

  @ApiProperty()
  @IsString()
  genreId: string;

  @ApiProperty()
  @IsOptional()
  tags?: string[];

  @ApiProperty()
  @IsOptional()
  publicStatus?: ReviewStatus = ReviewStatus.NOT_REQUESTED;

  @ApiProperty()
  @IsString()
  @IsOptional()
  creatorId?: string;
}
