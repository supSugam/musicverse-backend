import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  create(createGenreDto: CreateGenreDto) {
    return this.prisma.genre.create({
      data: {
        name: createGenreDto.name,
        description: createGenreDto.description,
      },
    });
  }

  findAll() {
    return this.prisma.genre.findMany();
  }

  findOne(id: string) {
    return this.prisma.genre.findUnique({ where: { id } });
  }

  update(id: string, updateGenreDto: UpdateGenreDto) {
    return this.prisma.genre.update({
      where: { id },
      data: {
        name: updateGenreDto.name,
        description: updateGenreDto.description,
      },
    });
  }

  remove(id: string) {
    return this.prisma.genre.delete({ where: { id } });
  }
}
