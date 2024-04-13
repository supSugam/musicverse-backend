import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/pagination/pagination.service';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';

@Injectable()
export class RecommendationsService {
  constructor(private readonly paginationService: PaginationService) {}

  private async getUserTracksHistory(
    userId: string,
    modelName: 'Play' | 'Download' | 'LikedTrack'
  ) {
    const tracksPlayed = await this.paginationService.paginate({
      modelName,
      select: {
        track: {
          select: {
            id: true,
            genre: {
              select: {
                name: true,
              },
            },
            tags: {
              select: {
                name: true,
              },
            },
            title: true,
          },
        },
      },
      where: {
        OR: [
          { userId },
          {
            user: {
              username: userId,
            },
          },
        ],
        AND: [
          {
            OR: [
              {
                track: {
                  publicStatus: ReviewStatus.APPROVED,
                },
              },
              {
                track: {
                  creator: {
                    username: userId,
                  },
                },
              },
            ],
          },
        ],
      },
    });

    return tracksPlayed.items.map((track) => ({
      id: track.track.id,
      title: track.track.title,
      genre: track.track.genre.name,
      tags: track.track.tags.map((tag) => tag.name),
    }));
  }

  async getUserInteractions(userId: string) {
    const userHistory = {
      playedTracks: await this.getUserTracksHistory(userId, 'Play'),
      downloadedTracks: await this.getUserTracksHistory(userId, 'Download'),
      likedTracks: await this.getUserTracksHistory(userId, 'LikedTrack'),
    };
    return userHistory;
  }

  async getAllTracks(userId?: string) {
    const tracks = await this.paginationService.paginate({
      modelName: 'Track',
      select: {
        id: true,
        title: true,
        genre: {
          select: {
            name: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
      where: {
        OR: [
          {
            publicStatus: ReviewStatus.APPROVED,
          },
          {
            creator: {
              username: userId,
            },
          },
        ],
      },
    });
    return tracks.items.map((track) => ({
      id: track.id,
      title: track.title,
      genre: track.genre.name,
      tags: track.tags.map((tag) => tag.name),
    }));
  }
}
