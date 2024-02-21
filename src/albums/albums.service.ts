import { BadRequestException, Injectable } from '@nestjs/common';
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

  async findAll() {
    return await this.prisma.album.findMany({
      include: {
        creator: true,
        genre: true,
        tags: true,
        tracks: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} album`;
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
      throw new BadRequestException({ message: 'Album not found' });
    }
  }

  async removeAll() {
    await this.prisma.album.deleteMany();
    await this.firebaseService.deleteDirectory({ directory: '/album' });
  }
}
