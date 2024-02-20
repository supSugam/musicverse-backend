import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { cleanObject } from 'src/utils/helpers/Object';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async create(createAlbumDto: CreateAlbumDto) {
    // Check if album with same title exists
    const albumExists = await this.prisma.album.findFirst({
      where: { title: createAlbumDto.title },
    });
    if (albumExists) {
      throw new BadRequestException('Album with same title already exists');
    }

    return await this.prisma.album.create({
      data: {
        title: createAlbumDto.title,
        description: createAlbumDto.description,
        genre: {
          connect: {
            id: createAlbumDto.genreId,
          },
        },
        creator: {
          connect: {
            id: createAlbumDto.creatorId,
          },
        },
        tags: {
          connect: createAlbumDto.tags?.map((tagId) => ({ id: tagId })),
        },
        publicStatus: createAlbumDto.publicStatus,
      },
    });
  }

  async findAll() {
    return await this.prisma.album.findMany({
      include: {
        creator: true,
        genre: true,
        tags: true,
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
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new BadRequestException('Album not found');
    }

    return await this.prisma.album.delete({
      where: { id },
    });
  }
}
