import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getBasePaginationDto } from 'src/pagination/dto/pagination.decorator';
import { AlbumPaginationDto } from './dto/album-pagination.dto';

export const AlbumsPaginationQueryParams = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AlbumPaginationDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ...getBasePaginationDto(request.query),
      creator: Boolean(request.query.creator),
      genre: Boolean(request.query.genre),
      tags: Boolean(request.query.tags),
      tracks: Boolean(request.query.tracks),
      savedBy: Boolean(request.query.likedBy),
    };
  }
);
