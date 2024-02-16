import { Injectable } from '@nestjs/common';
import { CreateTrackDto, CreateTrackPayload } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async create(createTrackDto: CreateTrackPayload) {
    this.prisma.track.create({
      data: {
        ...createTrackDto,
        creator: {
          connect: {
            id: createTrackDto.creatorId,
          },
        },
      },
    });
  }

  findAll() {
    return `This action returns all tracks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} track`;
  }

  update(id: number, updateTrackDto: UpdateTrackDto) {
    return `This action updates a #${id} track`;
  }

  remove(id: number) {
    return `This action removes a #${id} track`;
  }
}
