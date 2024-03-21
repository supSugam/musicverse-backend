import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SortOrder } from 'src/utils/enums/SortOrder.enum';
import { getBasePaginationDto } from 'src/pagination/dto/pagination.decorator';
import { PlaylistPaginationDto } from './dto/playlist-pagination.dto';

export const PlaylistsPaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PlaylistPaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...getBasePaginationDto(request.query),
      creator: Boolean(request.query.creator),
      savedBy: Boolean(request.query.savedBy),
      tags: Boolean(request.query.tags),
      tracks: Boolean(request.query.tracks),
      collaborators: Boolean(request.query.collaborators),
      containsTrack: request.query.containsTrack,
      owned: Boolean(request.query.owned),
      saved: Boolean(request.query.saved),
      collaborated: Boolean(request.query.collaborated),
    };
  }
);
