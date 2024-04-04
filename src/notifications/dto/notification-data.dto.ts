import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../notification-type.enum';

export class NotificationData {
  type: NotificationType;
  triggerUserId?: string;
  destinationId?: string;
}
