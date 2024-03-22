import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreatePlaylistDto,
  CreatePlaylistPayload,
} from './dto/create-playlist.dto';
import {
  UpdatePlaylistDto,
  UpdatePlaylistPayload,
} from './dto/update-playlist.dto';
import { cleanObject } from 'src/utils/helpers/Object';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlaylistsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService
  ) {}

  /**
   *
   *
   * @param {CreatePlaylistPayload} createPlaylistPayload
   * @return {*}
   * @memberof PlaylistsService
   */
  async create(createPlaylistPayload: CreatePlaylistPayload) {
    const { creatorId, title, tags, ...rest } = cleanObject(
      createPlaylistPayload
    );

    const playlistWithSameTitleExists = await this.prisma.playlist.findFirst({
      where: {
        title: title,
        creatorId: creatorId,
      },
    });
    if (playlistWithSameTitleExists) {
      throw new BadRequestException(
        'You already have a playlist with same title'
      );
    }

    return await this.prisma.playlist.create({
      data: {
        title,
        ...rest,
        creator: {
          connect: {
            id: creatorId,
          },
        },
        ...(tags && {
          tags: {
            connect: tags.map((tagId) => ({ id: tagId })),
          },
        }),
      },
    });
  }

  findOne(id: string, include: Prisma.PlaylistInclude) {
    try {
      return this.prisma.playlist.findUnique({
        where: {
          id,
        },
        include: {
          _count: true,
          ...include,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async update(id: string, updatePlaylistPayload: UpdatePlaylistPayload) {
    const { tags, creatorId, ...rest } = updatePlaylistPayload;

    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id,
      },
    });

    if (!playlist) {
      throw new BadRequestException('Playlist not found');
    }

    if (playlist.creatorId !== creatorId) {
      throw new BadRequestException(
        'You are not allowed to update the playlist'
      );
    }

    return await this.prisma.playlist.update({
      where: {
        id,
      },
      data: {
        ...rest,
        ...(tags && {
          tags: {
            set: tags.map((tagId) => ({ id: tagId })),
          },
        }),
      },
    });
  }

  async getSavedPlaylists(userId: string) {
    return await this.prisma.playlist.findMany({
      where: {
        savedBy: {
          some: {
            id: userId,
          },
        },
      },
    });
  }

  /**
   *
   *
   * @param {string} playlistId
   * @param {string} userId
   * @return {*}
   * @memberof PlaylistsService
   */
  async remove(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      throw new BadRequestException('Playlist not found');
    }

    if (playlist.creatorId !== userId) {
      throw new BadRequestException(
        'You are not allowed to delete the playlist'
      );
    }

    try {
      await this.prisma.playlist.delete({
        where: {
          id: playlistId,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
    return { message: 'Playlist deleted' };
  }

  async getOwnedPlaylists(userId: string) {
    return await this.prisma.playlist.findMany({
      where: {
        creatorId: userId,
      },
    });
  }

  async addTrackToPlaylists({
    trackId,
    playlists,
    userId,
  }: {
    trackId: string;
    playlists: string[];
    userId: string;
  }) {
    const track = await this.prisma.track.findUnique({
      where: {
        id: trackId,
      },
    });

    if (!track) {
      throw new BadRequestException('Track not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userPlaylists = await this.prisma.playlist.findMany({
      where: {
        id: {
          in: playlists,
        },
        OR: [
          {
            creatorId: userId,
          },
          {
            collaborators: {
              some: {
                id: userId,
              },
            },
          },
        ],
      },
    });

    if (userPlaylists.length !== playlists.length) {
      throw new BadRequestException(
        'You are not allowed to add track to some of the playlists'
      );
    }

    const trackPlaylists = await this.prisma.playlist.findMany({
      where: {
        id: {
          in: playlists,
        },
        tracks: {
          some: {
            id: trackId,
          },
        },
      },
    });

    if (trackPlaylists.length) {
      throw new BadRequestException('Track already exists in the playlist');
    }

    try {
      for (const playlist of playlists) {
        await this.prisma.playlist.update({
          where: {
            id: playlist,
          },
          data: {
            tracks: {
              connect: {
                id: trackId,
              },
            },
          },
        });
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
    return { message: 'Tracks added to playlist' };
  }

  async removeTrackFromPlaylists({
    trackId,
    playlists,
    userId,
  }: {
    trackId: string;
    playlists: string[];
    userId: string;
  }) {
    const track = await this.prisma.track.findUnique({
      where: {
        id: trackId,
      },
    });

    if (!track) {
      throw new BadRequestException('Track not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userPlaylists = await this.prisma.playlist.findMany({
      where: {
        id: {
          in: playlists,
        },
        OR: [
          {
            creatorId: userId,
          },
          {
            collaborators: {
              some: {
                id: userId,
              },
            },
          },
        ],
      },
    });

    if (userPlaylists.length !== playlists.length) {
      throw new BadRequestException(
        'You are not allowed to remove track from some of the playlists'
      );
    }

    const trackPlaylists = await this.prisma.playlist.findMany({
      where: {
        id: {
          in: playlists,
        },
        tracks: {
          some: {
            id: trackId,
          },
        },
      },
    });

    if (!trackPlaylists.length) {
      throw new BadRequestException('Track does not exist in the playlist');
    }

    try {
      for (const playlist of playlists) {
        await this.prisma.playlist.update({
          where: {
            id: playlist,
          },
          data: {
            tracks: {
              disconnect: {
                id: trackId,
              },
            },
          },
        });
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
    return { message: 'Tracks removed from playlist' };
  }

  async removeTracksFromPlaylist({
    tracks,
    playlistId,
    userId,
  }: {
    tracks: string[];
    playlistId: string;
    userId: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      throw new BadRequestException('Playlist not found');
    }

    const userPlaylists = await this.prisma.playlist.findMany({
      where: {
        id: playlistId,
        OR: [
          {
            creatorId: userId,
          },
          {
            collaborators: {
              some: {
                id: userId,
              },
            },
          },
        ],
      },
    });

    if (!userPlaylists.length) {
      throw new BadRequestException(
        'You are not allowed to remove tracks from the playlist'
      );
    }

    const trackPlaylists = await this.prisma.playlist.findMany({
      where: {
        id: playlistId,
        tracks: {
          some: {
            id: {
              in: tracks,
            },
          },
        },
      },
    });

    if (!trackPlaylists.length) {
      throw new BadRequestException('Tracks do not exist in the playlist');
    }

    try {
      for (const track of tracks) {
        await this.prisma.playlist.update({
          where: {
            id: playlistId,
          },
          data: {
            tracks: {
              disconnect: {
                id: track,
              },
            },
          },
        });
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
    return { message: 'Tracks removed from playlist' };
  }
}
