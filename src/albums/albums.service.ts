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

@Injectable()
export class AlbumsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService
  ) {}

  async create(createAlbumDto: CreateAlbumDto) {
    // Check if album with same title exists
    const albumExists = await this.prisma.album.findFirst({
      where: { title: createAlbumDto.title },
    });
    if (albumExists) {
      throw new BadRequestException('Album with same title already exists');
    }

    const payload = cleanObject(createAlbumDto);
    const { tags, genreId, creatorId, ...rest } = payload;
    return await this.prisma.album.create({
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
    });
  }

  async findOne(id: string) {
    const album = await this.prisma.album.findUnique({
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
      return album;
    }
  }

  update(id: string, updateAlbumDto: UpdateAlbumDto) {
    const payload = cleanObject(updateAlbumDto);
    return this.prisma.album.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.tags && {
          tags: {
            set: payload.tags.map((tagId) => ({ id: tagId })),
          },
        }),
      },
    });
  }

  async remove(id: string) {
    try {
      const deleteAlbum = await this.prisma.album.delete({
        where: { id },
      });
      await this.firebaseService.deleteDirectory({ directory: `album/${id}` });
      return deleteAlbum;
    } catch (error) {
      throw new BadRequestException({ message: ['Album not found'] });
    }
  }

  async toggleSaveAlbum(userId: string, albumId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException({ message: ['User not found'] });
    }

    const album = await this.prisma.savedAlbum.findUnique({
      where: {
        userId_albumId: {
          userId,
          albumId,
        },
      },
    });

    if (album) {
      await this.prisma.savedAlbum.delete({
        where: {
          id: album.id,
        },
      });
      return { message: 'Album Unsaved' };
    } else {
      await this.prisma.savedAlbum.create({
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
      return { message: 'Album Saved' };
    }
  }
}
