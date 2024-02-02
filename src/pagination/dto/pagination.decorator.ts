import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationDto } from './pagination.dto';
import { SortOrder } from 'src/utils/enums/SortOrder.enum';

export const PaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationDto => {
    const request = ctx.switchToHttp().getRequest();

    return {
      page: request.query.page ? String(request.query.page) : undefined,
      pageSize: request.query.pageSize
        ? String(request.query.pageSize)
        : undefined,
      search: request.query.search ? String(request.query.search) : undefined,
      sortOrder: (request.query.sortOrder as SortOrder) || SortOrder.ASC,
    };
  }
);
