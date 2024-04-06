import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaginationService } from 'src/pagination/pagination.service';
import { NotificationsPaginationQueryParams } from './notifications-pagination.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { NotificationPaginationDto } from './dto/notification-pagination.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly notificationsService: NotificationsService
  ) {}

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
    const { read, unread, type, sortOrder, ...paginationParams } = params;
    return await this.paginationService.paginate({
      modelName: 'Notification',
      where: {
        ...(type ? { type } : {}),
        ...(read ? { read } : {}),
        ...(unread ? { read: false } : {}),
        recipientId: userId,
      },
      include: {
        triggerUser: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            artistStatus: true,
            profile: true,
          },
        },
      },
      orderBy: {
        time: 'asc',
      },
      ...paginationParams,
    });
  }

  @Post('read/:id')
  @UseGuards(AuthGuard)
  async markAsRead(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    return await this.notificationsService.updateReadStatus(id, userId, true);
  }

  @Post('unread/:id')
  @UseGuards(AuthGuard)
  async markAsUnread(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    return await this.notificationsService.updateReadStatus(id, userId, false);
  }

  @Get('unread-count')
  @UseGuards(AuthGuard)
  async getUnreadNotificationsCount(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    return await this.notificationsService.getUnreadNotificationsCount(userId);
  }
}
