import {
  Controller,
  Get,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { TracksPaginationQueryParams } from 'src/tracks/tracks-pagination.decorator';
import { BasePaginationDto } from './dto/pagination.dto';

@Controller('search')
export class PaginationController {
  constructor(private readonly PaginationService: PaginationService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Request() req,
    @TracksPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: BasePaginationDto
  ) {
    const userId = req?.user?.id;
    const { page, pageSize, search } = params;
    // Most Popular Tracks
    const tracks = await this.PaginationService.paginate({
      page,
      pageSize,
      modelName: 'Track',
      where: {
        OR: [
          // Search by title
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        plays: {
          _count: 'desc',
        },
      },
      include: {
        creator: true,
        genre: true,
        albums: true,
      },
    });

    // Most Popular Playlists
    const playlists = await this.PaginationService.paginate({
      page,
      pageSize,
      modelName: 'Playlist',
      where: {
        OR: [
          // Search by title
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        savedBy: {
          _count: 'desc',
        },
      },
      include: {
        creator: true,
      },
    });

    // Most Popular Albums
    const albums = await this.PaginationService.paginate({
      page,
      pageSize,
      modelName: 'Album',
      where: {
        OR: [
          // Search by title
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        savedBy: {
          _count: 'desc',
        },
      },
      include: {
        creator: true,
        tags: true,
      },
    });

    return {
      tracks,
      playlists,
      albums,
    };
  }
}
