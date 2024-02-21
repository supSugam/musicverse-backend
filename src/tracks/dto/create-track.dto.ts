import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsNumberString,
  IsNumber,
} from 'class-validator';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';

export class CreateTrackDto {
  @ApiProperty({ example: 'Hardest To Love' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ example: 'This is my music I made..' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: 'lyrics' })
  @IsOptional()
  @IsString({ message: 'Lyrics must be a string' })
  lyrics?: string;

  @ApiProperty({ enum: ReviewStatus, example: 'NOT_REQUESTED' })
  @IsOptional()
  @IsEnum(ReviewStatus)
  publicStatus?: ReviewStatus = ReviewStatus.NOT_REQUESTED;

  @ApiProperty({ example: ['tag-id-1', 'tag-id-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Tag IDs must be strings' })
  tags?: string[];

  @ApiProperty({ example: 'genre-id-uuid' })
  @IsString({ message: 'Genre ID must be a string' })
  genreId: string;

  @ApiProperty()
  @IsNumberString({}, { message: 'trackDuration must be a number' })
  trackDuration: string;

  @ApiProperty()
  @IsNumberString({}, { message: 'previewDuration must be a number' })
  previewDuration: string;

  @ApiProperty()
  @IsNumberString({}, { message: 'trackSize must be a number' })
  trackSize: string;

  // Album Id on Creation (Optional)
  @ApiProperty()
  @IsOptional()
  @IsArray({ message: 'Album IDs must be an array' })
  @IsString({ each: true, message: 'Album IDs must be strings' })
  albumIds?: string[];
}

export class CreateTrackPayload extends CreateTrackDto {
  creatorId: string;
  src: string;
  preview?: string;
  cover?: string;
}
