import {
  Controller,
  Get,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { SearchPaginationQueryParams } from './dto/search-pagination.decorator';
import { SearchPaginationDto } from './dto/search-pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { cleanObject } from 'src/utils/helpers/Object';
import { BasePaginationQueryParams } from './dto/pagination.decorator';
import { BasePaginationDto } from './dto/pagination.dto';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';

@Controller('paginate')
export class PaginationController {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly prismaService: PrismaService
  ) {}

  @Get('search')
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
      const tracks = await this.paginationService.paginate({
        page,
        pageSize,
        modelName: 'Track',
        where: {
          AND: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
          OR: [
            {
              publicStatus: ReviewStatus.APPROVED,
            },
            {
              creatorId: userId,
            },
          ],
        },
        orderBy: {
          plays: {
            _count: 'desc',
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              artistStatus: true,
              profile: true,
            },
          },
          genre: true,
          albums: true,
        },
      });
      if (userId) {
        const likedTracks = await this.prismaService.likedTrack.findMany({
          where: {
            userId,
          },
        });
        tracks.items = tracks.items.map((track) => {
          track['isLiked'] = likedTracks.some(
            (likedTrack) => likedTrack.id === track.id
          );
          return track;
        });
      }
      response['tracks'] = tracks;
    }

    if (type === 'all' || type === 'playlists') {
      // Most Popular Playlists
      const playlists = await this.paginationService.paginate({
        page,
        pageSize,
        modelName: 'Playlist',
        where: {
          AND: [
            // Search by title
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
          OR: [
            {
              publicStatus: ReviewStatus.APPROVED,
            },
            {
              creatorId: userId,
            },
          ],
        },
        orderBy: {
          savedBy: {
            _count: 'desc',
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              artistStatus: true,
              profile: true,
            },
          },
          _count: true,
        },
      });
      response['playlists'] = playlists;
    }

    if (type === 'all' || type === 'albums') {
      // Most Popular Albums
      const albums = await this.paginationService.paginate({
        page,
        pageSize,
        modelName: 'Album',
        where: {
          AND: [
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
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              artistStatus: true,
              profile: true,
            },
          },
          tags: true,
          _count: true,
        },
      });
      response['albums'] = albums;
    }

    if (type === 'all' || type === 'users') {
      // Most Popular Users
      const users = await this.paginationService.paginate({
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
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          artistStatus: true,
          profile: true,
        },
      });
      response['users'] = users;
    }

    if (type === 'all' || type === 'artists') {
      const artists = await this.paginationService.paginate({
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
              profile: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        orderBy: {
          followers: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          artistStatus: true,
          profile: true,
        },
      });
      response['artists'] = artists;
    }

    return response;
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @Request() req,
    @BasePaginationQueryParams() params: BasePaginationDto
  ) {
    const newestTracks = await this.paginationService.paginate({
      page: params.page,
      pageSize: params.pageSize,
      modelName: 'Track',
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            artistStatus: true,
            profile: true,
          },
        },
        genre: true,
      },
      where: {
        AND: [
          {
            creator: {
              followers: {
                some: {
                  followerId: req.user.id,
                },
              },
            },
          },
          {
            publicStatus: ReviewStatus.APPROVED,
          },
        ],
      },
    });

    const newestPlaylists = await this.paginationService.paginate({
      page: params.page,
      pageSize: params.pageSize,
      modelName: 'Playlist',
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            artistStatus: true,
            profile: true,
          },
        },
        _count: true,
      },
      where: {
        AND: [
          {
            creator: {
              followers: {
                some: {
                  followerId: req.user.id,
                },
              },
            },
          },
          { publicStatus: ReviewStatus.APPROVED },
        ],
      },
    });

    const newestAlbums = await this.paginationService.paginate({
      page: params.page,
      pageSize: params.pageSize,
      modelName: 'Album',
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            artistStatus: true,
            profile: true,
          },
        },
        genre: true,
        _count: true,
      },
      where: {
        creator: {
          followers: {
            some: {
              followerId: req.user.id,
            },
          },
        },
      },
    });

    return {
      tracks: newestTracks.items.map((item) => ({ ...item, type: 'track' })),
      playlists: newestPlaylists.items.map((item) => ({
        ...item,
        type: 'playlist',
      })),
      albums: newestAlbums.items.map((item) => ({ ...item, type: 'album' })),
    };
  }
}
