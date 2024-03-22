import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  CreatePlaylistDto,
  CreatePlaylistPayload,
} from './create-playlist.dto';
import { IsBooleanString, IsOptional } from 'class-validator';

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {
  @ApiProperty({ example: 'true' })
  @IsBooleanString({ message: 'Delete cover must be a boolean string' })
  @IsOptional()
  deleteCover?: string = 'false';
}
export class UpdatePlaylistPayload extends PartialType(CreatePlaylistPayload) {
  deleteCover?: boolean;
}
