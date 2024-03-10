import { PartialType } from '@nestjs/swagger';
import {
  CreatePlaylistDto,
  CreatePlaylistPayload,
} from './create-playlist.dto';

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {}
export class UpdatePlaylistPayload extends PartialType(CreatePlaylistPayload) {}
