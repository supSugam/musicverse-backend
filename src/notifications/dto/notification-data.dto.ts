import { NotificationType } from '../notification-type.enum';

export interface NotificationData {
  type: NotificationType;
  triggerUserId?: string;
  destinationId?: string;
}
