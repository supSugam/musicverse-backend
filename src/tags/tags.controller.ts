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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UserRoles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { BasePaginationQueryParams } from 'src/pagination/dto/pagination.decorator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
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
    createTagDto: CreateTagDto
  ) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  async findAll(
    @BasePaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: BasePaginationDto
  ) {
    return await this.paginationService.paginate<'Tag'>({
      modelName: 'Tag',
      ...params,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @UserRoles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updatetagsDto: UpdateTagDto) {
    return this.tagsService.update(id, updatetagsDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @UserRoles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
