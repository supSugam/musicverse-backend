import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTrackDto, CreateTrackPayload } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { cleanObject } from 'src/utils/helpers/Object';

@Injectable()
export class TracksService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService
  ) {}

  async create(createTrackDto: CreateTrackPayload) {
    // Check if track with same title and same creator exists
    const payload = cleanObject(createTrackDto);
    const { creatorId, genreId, tags, albumIds, ...rest } = payload;
    const trackExists = await this.prisma.track.findFirst({
      where: {
        title: payload.title,
        creatorId: payload.creatorId,
      },
    });
    if (trackExists) {
      throw new BadRequestException('You already have a track with same title');
    }

    return await this.prisma.track.create({
      data: {
        ...rest,
        trackSize: +payload.trackSize,
        trackDuration: +payload.trackDuration,
        previewDuration: +payload.previewDuration,
        creator: {
          connect: {
            id: creatorId,
          },
        },
        genre: {
          connect: {
            id: genreId,
          },
        },
        ...(tags && {
          tags: {
            connect: tags.map((tagId) => ({ id: tagId })),
          },
        }),
        ...(albumIds && {
          albums: {
            connect: albumIds.map((albumId) => ({ id: albumId })),
          },
        }),
      },
    });
  }

  async findAll() {
    return await this.prisma.track.findMany({
      include: {
        creator: true,
        genre: true,
        tags: true,
        albums: true,
        likedBy: true,
        playlists: true,
        plays: true,
        _count: {
          select: {
            plays: true,
            likedBy: true,
            albums: true,
            playlists: true,
            tags: true,
          },
        },
      },
    });
  }

  async update(id: string, updateTrackpayload: UpdateTrackDto) {
    const payload = cleanObject(updateTrackpayload);
    const {
      tags,
      genreId,
      albumIds,
      trackDuration,
      trackSize,
      previewDuration,
      ...rest
    } = payload;
    return await this.prisma.track.update({
      where: { id },
      data: {
        ...rest,
        ...(tags && {
          tags: {
            set: tags.map((tagId) => ({ id: tagId })),
          },
        }),
        ...(albumIds && {
          albums: {
            set: albumIds.map((albumId) => ({ id: albumId })),
          },
        }),
      },
    });
  }

  async isTrackOwner(trackId: string, userId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      select: { creatorId: true },
    });
    if (!track) throw new BadRequestException({ message: 'Track not found' });

    return track && track.creatorId === userId;
  }

  async remove(id: string) {
    try {
      await this.prisma.track.delete({
        where: { id },
      });
      await this.firebaseService.deleteDirectory({ directory: `track/${id}` });
    } catch (error) {
      throw new BadRequestException({ message: 'Track not found' });
    }
  }

  async removeAll() {
    await this.prisma.track.deleteMany({});
    await this.firebaseService.deleteDirectory({ directory: '/track' });
  }
  async toggleLike(trackId: string, userId: string) {
    const likedTrack = await this.prisma.likedTrack.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (likedTrack) {
      // User already liked the track, so unlike it
      await this.prisma.likedTrack.delete({
        where: { id: likedTrack.id },
      });
      return { message: 'Track unliked.' };
    } else {
      // User hasn't liked the track, so like it
      await this.prisma.likedTrack.create({
        data: {
          userId,
          trackId,
        },
      });

      return { message: 'Track liked.' };
    }
  }

  async getLikedTracks(userId: string) {
    return await this.prisma.track.findMany({
      where: {
        likedBy: {
          some: {
            userId,
          },
        },
      },
    });
  }

  async play(trackId: string) {
    return await this.prisma.play.create({
      data: {
        trackId,
      },
    });
  }

  async getTotalPlaysCount(trackId: string) {
    return await this.prisma.play.count({
      where: {
        trackId,
      },
    });
  }
}
