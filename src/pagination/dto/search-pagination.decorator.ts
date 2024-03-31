import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getBasePaginationDto } from 'src/pagination/dto/pagination.decorator';
import { SearchPaginationDto } from './search-pagination.dto';

export const SearchPaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SearchPaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...getBasePaginationDto(request.query),
      type: request.query.type,
    };
  }
);
