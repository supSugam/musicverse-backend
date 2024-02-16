import { PartialType } from '@nestjs/swagger';
import { CreateTrackDto, CreateTrackPayload } from './create-track.dto';

export class UpdateTrackDto extends PartialType(CreateTrackDto) {
  cover?: string;
}
