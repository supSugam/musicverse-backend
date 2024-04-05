import {
  Controller,
  Get,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaginationService } from 'src/pagination/pagination.service';
import { NotificationsPaginationQueryParams } from './notifications-pagination.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { NotificationPaginationDto } from './dto/notification-pagination.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly paginationService: PaginationService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Request() req,
    @NotificationsPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: NotificationPaginationDto
  ) {
    const userId = req.user.id;
    const { read, unread, type, ...paginationParams } = params;
    return await this.paginationService.paginate({
      modelName: 'Notification',
      where: {
        ...(type ? { type } : {}),
        ...(read ? { read } : {}),
        ...(unread ? { read: false } : {}),
        recipientId: userId,
      },

      ...paginationParams,
    });
  }
}
