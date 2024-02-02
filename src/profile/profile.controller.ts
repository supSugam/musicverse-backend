import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.decorator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly paginationService: PaginationService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createProfileDto: CreateProfileDto
  ) {
    return this.profileService.create(req['user'].id, createProfileDto);
  }

  @Get()
  async findAll(
    @PaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: PaginationDto
  ) {
    return await this.paginationService.paginate({
      modelName: 'profile',
      ...params,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(req['user'].id, updateProfileDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req) {
    return this.profileService.remove(req['user'].id);
  }
}
