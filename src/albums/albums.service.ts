import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { cleanObject } from 'src/utils/helpers/Object';
import { FirebaseService } from 'src/firebase/firebase.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from 'src/notifications/notification-type.enum';
import { SaveAlbumPayload } from 'src/notifications/payload.type';

@Injectable()
export class AlbumsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(createAlbumDto: CreateAlbumDto) {
    // Check if album with same title exists
    const albumExists = await this.prismaService.album.findFirst({
      where: { title: createAlbumDto.title },
    });
    if (albumExists) {
      throw new BadRequestException('Album with same title already exists');
    }

    const payload = cleanObject(createAlbumDto);
    const { tags, genreId, creatorId, ...rest } = payload;
    return await this.prismaService.album.create({
      data: {
        ...rest,
        ...(tags && {
          tags: {
            connect: tags.map((tagId) => ({ id: tagId })),
          },
        }),
        genre: {
          connect: {
            id: genreId,
          },
        },
        creator: {
          connect: {
            id: creatorId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const album = await this.prismaService.album.findUnique({
      where: {
        id,
      },
      include: {
        _count: true,
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
        tags: true,
        tracks: true,
      },
    });

    if (!album) {
      throw new NotFoundException({ message: [`Album doesn't exist`] });
    } else {
      if (userId) {
        album.creator['isMe'] = album.creator.id === userId;

        album.creator['isFollowing'] =
          !!(await this.prismaService.user.findFirst({
            where: {
              id: userId,
              following: {
                some: {
                  id: album.creator.id,
                },
              },
            },
          }));

        album['isSaved'] =
          (await this.prismaService.savedAlbum.count({
            where: {
              userId,
              albumId: album.id,
            },
          })) > 0;
      }
      return album;
    }
  }

  update(id: string, updateAlbumDto: UpdateAlbumDto) {
    const payload = cleanObject(updateAlbumDto);
    return this.prismaService.album.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.tags && {
          tags: {
            set: payload.tags.map((tagId) => ({ id: tagId })),
          },
        }),
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    try {
      await this.prismaService.album.delete({
        where: { id },
      });
      await this.firebaseService.deleteDirectory({ directory: `album/${id}` });
      return { message: 'Album deleted' };
    } catch (error) {
      throw new BadRequestException({
        message: error.message || 'Error deleting album',
      });
    }
  }

  async toggleSaveAlbum(userId: string, albumId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException({ message: ['User not found'] });
    }

    const album = await this.prismaService.savedAlbum.findUnique({
      where: {
        userId_albumId: {
          userId,
          albumId,
        },
      },
    });

    if (album) {
      await this.prismaService.savedAlbum.delete({
        where: {
          id: album.id,
        },
      });
      const updatedCount = await this.prismaService.savedAlbum.count({
        where: {
          albumId,
        },
      });
      return { message: 'Album Unsaved', count: updatedCount };
    } else {
      await this.prismaService.savedAlbum.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          album: {
            connect: {
              id: albumId,
            },
          },
        },
      });
      const updatedCount = await this.prismaService.savedAlbum.count({
        where: {
          albumId,
        },
      });
      this.eventEmitter.emit(NotificationType.SAVE_ALBUM, {
        albumId,
        userId,
      } as SaveAlbumPayload);
      return { message: 'Album Saved', count: updatedCount };
    }
  }

  async isAlbumOwner(albumId: string, userId: string) {
    return !!(await this.prismaService.album.findFirst({
      where: {
        id: albumId,
        creatorId: userId,
      },
    }));
  }
}
