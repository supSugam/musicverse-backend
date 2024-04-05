import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';
import { NotificationType } from '../notification-type.enum';

export class NotificationPaginationDto extends BasePaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ required: false })
  @IsOptional()
  read?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  unread?: boolean;
}
