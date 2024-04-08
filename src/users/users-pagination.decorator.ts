import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getBasePaginationDto } from 'src/pagination/dto/pagination.decorator';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { isPureBoolean } from 'src/utils/helpers/string';

export const UsersPaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...getBasePaginationDto(request.query),
      artistStatus: request.query.artistStatus,
      isVerified: isPureBoolean(request.query.isVerified)
        ? request.query.isVerified
        : undefined,
      role: request.query.role,
    };
  }
);
