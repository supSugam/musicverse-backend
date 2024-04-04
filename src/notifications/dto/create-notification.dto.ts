import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'New Upload',
    description: 'Title of the notification',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'A new track has been uploaded',
    description: 'Body of the notification',
  })
  @IsString()
  body: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the image to display in the notification',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'user-id',
    description: 'ID of the user to whom the notification should be sent',
  })
  @IsString()
  recipientId: string;

  @ApiProperty({
    example: 'user-id',
    description: 'ID of the user who triggered the notification',
  })
  @IsOptional()
  @IsString()
  triggerUserId?: string;

  @ApiProperty({ example: 'NEW_TRACK', description: 'Type of notification' })
  @IsEnum(NotificationType)
  type: NotificationType;
}
