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
import { CreateTrackDto } from './dto/create-track.dto';
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
import { TracksPaginationQueryParams } from './tracks-pagination.decorator';
import { cleanObject } from 'src/utils/helpers/Object';
import { PaginationService } from 'src/pagination/pagination.service';
import { TrackPaginationDto } from './dto/track-pagination.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from 'src/notifications/notification-type.enum';
import {
  DownloadTrackPayload,
  NewTrackPayload,
} from 'src/notifications/payload.type';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly firebaseService: FirebaseService,
    private readonly paginationService: PaginationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prismaService: PrismaService
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
      await this.tracksService.remove(trackId);
      throw error;
    }

    const track = await this.tracksService.update(trackId, uploaded);

    // Emit new track event
    if (!createTrackDto.albumIds || createTrackDto.albumIds.length === 0) {
      this.eventEmitter.emit(NotificationType.NEW_TRACK, {
        artistId: track.creatorId,
        artistName: track.creator.profile.name || track.creator.username,
        title: track.title,
        imageUrl: track.cover,
      } as NewTrackPayload);
    }
    return track;
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Request() req,
    @TracksPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: TrackPaginationDto
  ) {
    const userId = req?.user?.id;
    const isAdmin = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        role: Role.ADMIN,
      },
    });

    const {
      page,
      pageSize,
      search,
      sortOrder,
      selectedGenre,
      selectedTag,
      creatorId,
      liked,
      owned,
      publicStatus,
      ...rest
    } = cleanObject(params);

    const res = await this.paginationService.paginate({
      modelName: 'Track',
      include: {
        ...rest,
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            artistStatus: true,
            profile: true,
          },
        },
        _count: true,
      },

      page,
      pageSize,
      where: {
        AND: {
          ...(selectedGenre && { genreId: selectedGenre }),
          ...(selectedTag && { tags: { some: { id: selectedTag } } }),
          ...(search && { title: { contains: search, mode: 'insensitive' } }),
          ...(creatorId && { creatorId }),
          ...(liked && {
            likedBy: {
              some: {
                userId,
              },
            },
          }),
          ...(owned && { creatorId: userId }),
          ...(userId
            ? creatorId === userId || isAdmin
              ? { publicStatus }
              : { publicStatus: ReviewStatus.APPROVED }
            : { publicStatus: ReviewStatus.APPROVED }),
        },
      },
    });
    if (userId) {
      const likedTracks = await this.tracksService.getLikedTracks(userId);
      res.items = res.items.map((track) => {
        track['isLiked'] = likedTracks.some(
          (likedTrack) => likedTrack.id === track.id
        );
        return track;
      });
    }
    return res;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Request() req, @Param('id') trackId: string) {
    const userId: string | undefined = req.user.id;
    return await this.tracksService.findOne(trackId, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
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
    const isAdmin = await this.prismaService.user.findFirst({
      where: {
        id: creatorId,
        role: Role.ADMIN,
      },
    });

    if (!isTrackOwner && !isAdmin) {
      throw new BadRequestException({
        message: ['You are not the owner of this track'],
      });
    }
    const payload = {
      ...updateTrackDto,
    };

    if (files) {
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
    }

    return await this.tracksService.update(id, payload);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    const creatorId = req.user.id as string;
    const isTrackOwner = await this.tracksService.isTrackOwner(id, creatorId);
    const isAdmin = await this.prismaService.user.findFirst({
      where: {
        id: creatorId,
        role: Role.ADMIN,
      },
    });
    if (!isTrackOwner && !isAdmin) {
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

  @Post('toggle-like/:id')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  async toggleLike(@Request() req, @Param('id') id: string) {
    const userId = req.user.id as string;
    return await this.tracksService.toggleLike(id, userId);
  }

  @Get('liked')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  async getLikedTracks(@Request() req) {
    const userId = req.user.id as string;
    return await this.tracksService.getLikedTracks(userId);
  }

  //play

  @Post('play/:id')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  async play(@Request() req, @Param('id') id: string) {
    const userId = req.user.id as string;
    return await this.tracksService.play(id, userId);
  }

  // download
  @Post('download/:id')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  async download(@Request() req, @Param('id') trackId: string) {
    const userId = req.user.id as string;

    // Emit download track event
    this.eventEmitter.emit(NotificationType.DOWNLOAD_TRACK, {
      trackId,
      userId,
    } as DownloadTrackPayload);

    return await this.tracksService.download(trackId, userId);
  }
}
