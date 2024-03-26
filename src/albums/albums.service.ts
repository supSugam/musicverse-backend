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
      await this.prisma.album.delete({
        where: { id },
      });
      await this.firebaseService.deleteDirectory({ directory: `album/${id}` });
    } catch (error) {
      throw new BadRequestException({ message: ['Album not found'] });
    }
  }

  async toggleSaveAlbum(userId: string, albumId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedAlbums: true,
      },
    });

    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
    });

    if (!user || !album) {
      throw new BadRequestException('User or Album not found');
    }

    const isAlbumSaved = user.savedAlbums.some(
      (savedAlbum) => savedAlbum.id === albumId
    );

    if (isAlbumSaved) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          savedAlbums: {
            disconnect: {
              id: albumId,
            },
          },
        },
      });
      return { message: ['Album Unsaved'] };
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          savedAlbums: {
            connect: {
              id: albumId,
            },
          },
        },
      });
      return { message: ['Album Unsaved'] };
    }
  }
}
