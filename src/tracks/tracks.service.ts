import { Injectable } from '@nestjs/common';
import { CreateTrackDto, CreateTrackPayload } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async create(createTrackDto: CreateTrackPayload) {
    return await this.prisma.track.create({
      data: {
        title: createTrackDto.title,
        description: createTrackDto.description,
        src: createTrackDto.src,
        preview: createTrackDto.preview,
        cover: createTrackDto.cover,
        lyrics: createTrackDto.lyrics,
        publicStatus: createTrackDto.publicStatus,
        creator: {
          connect: {
            id: createTrackDto.creatorId,
          },
        },
        genre: {
          connect: {
            id: createTrackDto.genreId,
          },
        },
        tags: {
          connect: createTrackDto.tags?.map((tagId) => ({ id: tagId })),
        },

        // Optionally, you can handle other fields like playlists, albums, etc.
      },
    });
  }

  findAll() {
    return `This action returns all tracks`;
  }

  async update(id: string, updateTrackpayload: UpdateTrackDto) {
    return await this.prisma.track.update({
      where: { id },
      data: {
        ...updateTrackpayload,
        ...(updateTrackpayload.tags && {
          tags: {
            set: updateTrackpayload.tags.map((tagId) => ({ id: tagId })),
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
    return track.creatorId === userId;
  }
}
