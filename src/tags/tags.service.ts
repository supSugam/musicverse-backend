import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  create(createTagDto: CreateTagDto) {
    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
      },
    });
  }

  findAll() {
    return this.prisma.tag.findMany();
  }

  findOne(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  update(id: string, updateTagDto: UpdateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data: {
        name: updateTagDto.name,
      },
    });
  }

  remove(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
