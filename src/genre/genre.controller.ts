import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { UserRoles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { BasePaginationQueryParams } from 'src/pagination/dto/pagination.decorator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';

@Controller('genre')
export class GenreController {
  constructor(
    private readonly genreService: GenreService,
    private readonly paginationService: PaginationService
  ) {}
  @UseGuards(AuthGuard, RolesGuard)
  @UserRoles(Role.ADMIN)
  @Post()
  create(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    )
    createGenreDto: CreateGenreDto
  ) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  async findAll(
    @BasePaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: BasePaginationDto
  ) {
    return await this.paginationService.paginate({
      modelName: 'genre',
      ...params,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.genreService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @UserRoles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @UserRoles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.genreService.remove(id);
  }
}
