import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BasePaginationDto } from './pagination.dto';
import { SortOrder } from 'src/utils/enums/SortOrder.enum';

export const BasePaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): BasePaginationDto => {
    const request = ctx.switchToHttp().getRequest();

    return getBasePaginationDto(request.query);
  }
);

export const getBasePaginationDto = (obj: any): BasePaginationDto => {
  return {
    page: obj.page ? String(obj.page) : undefined,
    pageSize: obj.pageSize ? String(obj.pageSize) : undefined,
    search: obj.search ? String(obj.search) : undefined,
    sortOrder: obj.sortOrder || SortOrder.ASC,
  };
};
