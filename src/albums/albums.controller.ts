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
  ValidationPipe,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiConsumes } from '@nestjs/swagger';
import { Role } from 'src/guards/roles.enum';
import { UserRoles } from 'src/guards/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileValidator } from 'src/app.validator';
import {
  ALLOWED_IMAGE_MIMETYPES,
  FIREBASE_STORAGE_DIRS,
} from 'src/utils/constants';
import { FirebaseService } from 'src/firebase/firebase.service';
import { cleanObject } from 'src/utils/helpers/Object';
import { PaginationService } from 'src/pagination/pagination.service';
import { AlbumsPaginationQueryParams } from './album-pagination.decorator';
import { AlbumPaginationDto } from './dto/album-pagination.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { NewAlbumPayload } from 'src/notifications/payload.type';

@Controller('albums')
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly firebaseService: FirebaseService,
    private readonly paginationService: PaginationService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  async create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createAlbumDto: CreateAlbumDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileValidator({
            cover: {
              fileTypes: ALLOWED_IMAGE_MIMETYPES,
              maxFileSize: 1024 * 1024 * 2,
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
    const coverFile = files?.cover?.[0];
    const payload = {
      ...createAlbumDto,
      creatorId: req.user.id as string,
    };

    let album = await this.albumsService.create(payload);

    if (coverFile) {
      const coverUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.ALBUM_COVER(album.id),
        fileName: album.id,
        fileBuffer: coverFile.buffer,
        originalFilename: coverFile.originalname,
        fileType: 'image',
      });

      album = await this.albumsService.update(album.id, { cover: coverUrl });
    }

    // Only If album is public
    this.eventEmitter.emit(NotificationType.NEW_ALBUM, {
      albumId: album.id,
      artistId: album.creatorId,
      artistName: album.creator.profile?.name || album.creator.username,
      title: album.title,
      imageUrl: album.cover,
    } as NewAlbumPayload);
    //TODO: use createMany to create multiple tracks for this album

    return album;
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Request() req,
    @AlbumsPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: AlbumPaginationDto
  ) {
    const userId = req.user.id as string;
    const {
      page,
      pageSize,
      search,
      sortOrder,
      creator,
      savedBy,
      saved,
      owned,
      tracks,
      ...rest
    } = cleanObject(params);

    return await this.paginationService.paginate({
      modelName: 'Album',
      include: {
        ...rest,
        ...(tracks && {
          tracks: {
            include: {
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
            },
          },
        }),
        ...(creator && {
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
        }),
        ...(savedBy && {
          savedBy: {
            select: {
              id: true,
              user: {
                select: {
                  profile: true,
                },
              },
            },
          },
        }),
        _count: true,
      },
      page,
      pageSize,
      where: {
        ...(search && { title: search }),
        ...(saved && { savedBy: { some: { id: userId } } }),
        ...(owned
          ? { creatorId: userId }
          : saved
            ? {
                savedBy: {
                  some: {
                    userId,
                  },
                },
              }
            : {}),
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.albumsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    //TODO: this should be similar to the create method
    return this.albumsService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.albumsService.remove(id);
  }

  @Patch('toggle-save/:albumId')
  @UseGuards(AuthGuard)
  async toggleSave(@Request() req, @Param('albumId') albumId: string) {
    const userId = req.user.id as string;
    return await this.albumsService.toggleSaveAlbum(userId, albumId);
  }
}
