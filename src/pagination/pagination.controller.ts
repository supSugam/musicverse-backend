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
import { SearchPaginationQueryParams } from './dto/search-pagination.decorator';
import { SearchPaginationDto } from './dto/search-pagination.dto';

@Controller('search')
export class PaginationController {
  constructor(private readonly PaginationService: PaginationService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Request() req,
    @SearchPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: SearchPaginationDto
  ) {
    const userId = req?.user?.id;
    const { page, pageSize, search, type } = params;
    // Most Popular Tracks
    const response = {};

    if (type === 'all' || type === 'tracks') {
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
      response['tracks'] = tracks;
    }

    if (type === 'all' || type === 'playlists') {
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
      response['playlists'] = playlists;
    }

    if (type === 'all' || type === 'albums') {
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
      response['albums'] = albums;
    }

    if (type === 'all' || type === 'users') {
      // Most Popular Users
      const users = await this.PaginationService.paginate({
        page,
        pageSize,
        modelName: 'User',
        where: {
          OR: [
            // Search by username
            {
              username: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          followers: {
            _count: 'desc',
          },
        },

        include: {
          profile: {
            select: {
              avatar: true,
              cover: true,
              name: true,
              id: true,
            },
          },
        },
      });
      response['users'] = users;
    }

    if (type === 'all' || type === 'genres') {
      // Most Popular Genres
      const genres = await this.PaginationService.paginate({
        page,
        pageSize,
        modelName: 'Genre',
        where: {
          OR: [
            // Search by name
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          tracks: {
            _count: 'desc',
          },
        },
      });
      response['genres'] = genres;
    }

    return response;
  }
}
