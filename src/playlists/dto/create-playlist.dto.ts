import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';

export class CreatePlaylistDto {
  @ApiProperty({ example: 'Hardest To Love' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ example: 'This is my music I made..' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: ['tag-id-1', 'tag-id-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Tag IDs must be strings' })
  tags?: string[];

  @ApiProperty({ example: 'APPROVED' })
  @IsOptional()
  @IsEnum(ReviewStatus)
  publicStatus?: ReviewStatus = ReviewStatus.NOT_REQUESTED;
}

export class CreatePlaylistPayload extends CreatePlaylistDto {
  cover?: string;
  creatorId: string;
}
