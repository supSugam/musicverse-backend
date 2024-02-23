import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SortOrder } from 'src/utils/enums/SortOrder.enum';
import { TrackPaginationDto } from './dto/track-pagination.dto';
import { getBasePaginationDto } from 'src/pagination/dto/pagination.decorator';

export const TracksPaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TrackPaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...getBasePaginationDto(request.query),
      albums: Boolean(request.query.albums),
      creator: Boolean(request.query.creator),
      genre: Boolean(request.query.genre),
      playlists: Boolean(request.query.playlists),
      likedBy: Boolean(request.query.likedBy),
      tags: Boolean(request.query.tags),
      selectedGenre: request.query.selectedGenre,
      selectedTag: request.query.selectedTag,
    };
  }
);
