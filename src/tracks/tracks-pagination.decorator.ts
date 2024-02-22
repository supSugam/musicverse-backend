import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SortOrder } from 'src/utils/enums/SortOrder.enum';
import { TracksPaginationDto } from './dto/track-pagination.dto';

export const TracksPaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TracksPaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.query);
    return {
      page: request.query.page ? String(request.query.page) : undefined,
      pageSize: request.query.pageSize
        ? String(request.query.pageSize)
        : undefined,
      search: request.query.search ? String(request.query.search) : undefined,
      sortOrder: (request.query.sortOrder as SortOrder) || SortOrder.ASC,
      albums: Boolean(request.query.albums),
      creator: Boolean(request.query.artists),
      genre: Boolean(request.query.genres),
      playlists: Boolean(request.query.playlists),
      likedBy: Boolean(request.query.likedBy),
      tags: Boolean(request.query.tags),
    };
  }
);
