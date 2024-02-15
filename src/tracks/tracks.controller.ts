import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Request,
  ValidationPipe,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ALLOWED_AUDIO_MIMETYPES,
  ALLOWED_IMAGE_MIMETYPES,
} from 'src/utils/constants';
import { CustomUploadFileValidator } from 'src/app.validator';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'src', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'preview', maxCount: 1 },
    ])
  )
  async create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createTrackDto: CreateTrackDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileValidator({
            fileTypes: ALLOWED_AUDIO_MIMETYPES,
            maxFileSize: 1024 * 200,
          })
        )
        .addValidator(
          new CustomUploadFileValidator({
            fileTypes: ALLOWED_IMAGE_MIMETYPES,
            maxFileSize: 1024 * 1024 * 2,
          })
        )
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        })
    )
    files: {
      src?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      preview?: Express.Multer.File[];
    }
  ) {
    const { user } = req;
    // TODO: streams/chunks upload
  }

  @Get()
  findAll() {
    return this.tracksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto) {
    return this.tracksService.update(+id, updateTrackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tracksService.remove(+id);
  }
}
