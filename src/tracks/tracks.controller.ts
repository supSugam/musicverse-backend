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
  Response,
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
import { RolesGuard } from 'src/guards/roles.guard';

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
    console.log(files, 'files');

    const srcFile = files?.src?.[0];
    const coverFile = files?.cover?.[0];
    const previewFile = files?.preview?.[0];
    const payload = {
      ...createTrackDto,
      creatorId: req.user.id as string,
      src: '',
    };
    if (!srcFile) {
      throw new BadRequestException({
        message: ['src is required'],
      });
    }

    const { id: trackId } = await this.tracksService.create(payload);

    const uploaded = {};
    try {
      const trackUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.TRACK_SRC(trackId),
        fileName: trackId,
        fileBuffer: srcFile.buffer,
        originalFilename: srcFile.originalname,
        fileType: 'audio',
      });
      uploaded['src'] = trackUrl;

      if (coverFile) {
        const coverUrl = await this.firebaseService.uploadFile({
          directory: FIREBASE_STORAGE_DIRS.TRACK_COVER(trackId),
          fileName: trackId,
          fileBuffer: coverFile.buffer,
          originalFilename: coverFile.originalname,
          fileType: 'image',
        });
        uploaded['cover'] = coverUrl;
      }

      if (previewFile) {
        const previewUrl = await this.firebaseService.uploadFile({
          directory: FIREBASE_STORAGE_DIRS.TRACK_PREVIEW(trackId),
          fileName: trackId,
          fileBuffer: previewFile.buffer,
          originalFilename: previewFile.originalname,
          fileType: 'audio',
        });
        uploaded['preview'] = previewUrl;
      }
    } catch (error) {
      console.log(error);
      await this.tracksService.remove(trackId);
      throw error;
    }

    return await this.tracksService.update(trackId, uploaded);
  }

  @Get()
  findAll() {
    // return this.tracksService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return await this.tracksService.findOne(id);
  // }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateTrackDto: UpdateTrackDto,
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
      cover?: Express.Multer.File[];
    }
  ) {
    const creatorId = req.user.id as string;
    const isTrackOwner = await this.tracksService.isTrackOwner(id, creatorId);

    if (!isTrackOwner) {
      throw new BadRequestException({
        message: ['You are not the owner of this track'],
      });
    }
    const payload = {
      ...updateTrackDto,
    };
    const {
      cover: [coverFile],
    } = files;
    if (coverFile) {
      const coverUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.TRACK_COVER(id),
        fileName: id,
        fileBuffer: coverFile.buffer,
        originalFilename: coverFile.originalname,
        fileType: 'image',
      });
      payload['cover'] = coverUrl;
    }

    return await this.tracksService.update(id, payload);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    const creatorId = req.user.id as string;
    console.log(creatorId, 'creatorId');
    const isTrackOwner = await this.tracksService.isTrackOwner(id, creatorId);
    const canDelete = req.user.role === Role.ADMIN || isTrackOwner;
    if (!canDelete) {
      throw new BadRequestException({
        message: ['You are not the owner of this track'],
      });
    }
    await this.tracksService.remove(id);
    return { message: ['Track deleted successfully'] };
  }

  @Delete()
  @UseGuards(AuthGuard)
  @UserRoles(Role.ADMIN)
  async removeAll() {
    await this.tracksService.removeAll();
    return { message: ['All tracks deleted successfully'] };
  }
}
