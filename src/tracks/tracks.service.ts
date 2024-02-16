import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTrackDto, CreateTrackPayload } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class TracksService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService
  ) {}

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
}
