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
  BadRequestException,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto, CreateTrackPayload } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ALLOWED_AUDIO_MIMETYPES,
  ALLOWED_IMAGE_MIMETYPES,
  FIREBASE_STORAGE_DIRS,
} from 'src/utils/constants';
import { CustomUploadFileValidator } from 'src/app.validator';
import { UserRoles } from 'src/guards/roles.decorator';
import { Role } from 'src/guards/roles.enum';
import { FirebaseService } from 'src/firebase/firebase.service';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
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
            src: {
              fileTypes: ALLOWED_AUDIO_MIMETYPES,
              maxFileSize: 1024 * 1024 * 200,
            },
            cover: {
              fileTypes: ALLOWED_IMAGE_MIMETYPES,
              maxFileSize: 1024 * 1024 * 2,
            },
            preview: {
              fileTypes: ALLOWED_AUDIO_MIMETYPES,
              maxFileSize: 1024 * 1024 * 20,
            },
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
    const { src, cover, preview } = files;
    const payload = {
      ...createTrackDto,
      creatorId: req.user.id as string,
      src: '',
    };
    if (!src) {
      throw new BadRequestException({
        message: ['src is required'],
      });
    }

    const track = await this.tracksService.create(payload);

    const avatarUrl = await this.firebaseService.uploadFile({
      directory: FIREBASE_STORAGE_DIRS.USER_AVATAR(userId),
      fileName: userId,
      fileBuffer: avatar.buffer,
      originalFilename: avatar.originalname,
      fileType: 'image',
    });
    payload['avatar'] = avatarUrl;
    // console.log(createTrackDto, 'createTrackDto');
    return 'TODO: create track';
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
