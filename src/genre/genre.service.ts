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
    return this.findOne(id);
  }

  update(id: number, updateGenreDto: UpdateGenreDto) {
    return this.update(id, updateGenreDto);
  }

  remove(id: number) {
    return this.remove(id);
  }
}
