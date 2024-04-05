import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getBasePaginationDto } from 'src/pagination/dto/pagination.decorator';
import { NotificationPaginationDto } from './dto/notification-pagination.dto';

export const NotificationsPaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): NotificationPaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...getBasePaginationDto(request.query),
      read: Boolean(request.query.read),
      unread: Boolean(request.query.unread),
      type: request.query.type,
    };
  }
);
