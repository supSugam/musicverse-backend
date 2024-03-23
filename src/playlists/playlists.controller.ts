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
  Query,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import {
  UpdatePlaylistDto,
  UpdatePlaylistPayload,
} from './dto/update-playlist.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiConsumes } from '@nestjs/swagger';
import { Role } from 'src/guards/roles.enum';
import { UserRoles } from 'src/guards/roles.decorator';
import { CustomUploadFileValidator } from 'src/app.validator';
import {
  ALLOWED_IMAGE_MIMETYPES,
  FIREBASE_STORAGE_DIRS,
} from 'src/utils/constants';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from 'src/firebase/firebase.service';
import { cleanObject } from 'src/utils/helpers/Object';
import { PaginationService } from 'src/pagination/pagination.service';
import { PlaylistPaginationDto } from './dto/playlist-pagination.dto';
import { PlaylistsPaginationQueryParams } from './playlist-pagination.decorator';

@Controller('playlists')
export class PlaylistsController {
  constructor(
    private readonly playlistsService: PlaylistsService,

    private readonly firebaseService: FirebaseService,
    private readonly paginationService: PaginationService
  ) {}

  // @Post()
  // create(@Body() createPlaylistDto: CreatePlaylistDto) {
  //   return this.playlistsService.create(createPlaylistDto);
  // }

  @Post()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  async create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPlaylistDto: CreatePlaylistDto,
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
      ...createPlaylistDto,
      creatorId: req.user.id as string,
    };

    const playlist = await this.playlistsService.create(payload);

    if (coverFile) {
      const coverUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.PLAYLIST_COVER(playlist.id),
        fileBuffer: coverFile.buffer,
        fileName: playlist.id,
        fileType: 'image',
        originalFilename: coverFile.originalname,
      });
      const updatedPlaylist = await this.playlistsService.update(playlist.id, {
        cover: coverUrl,
      });
      return updatedPlaylist;
    }

    return playlist;
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Request() req,
    @PlaylistsPaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: PlaylistPaginationDto
  ) {
    const userId = req?.user?.id;
    const {
      page,
      pageSize,
      search,
      sortOrder,
      collaborators,
      savedBy,
      containsTrack,
      creator,
      owned,
      collaborated,
      saved,
      ...rest
    } = cleanObject(params);

    const res = await this.paginationService.paginate({
      modelName: 'Playlist',
      where: {
        AND: [
          {
            ...(search && {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            }),
            ...(owned && { creatorId: userId }),
            ...(saved && { savedBy: { some: { userId } } }),
            ...(collaborated && { collaborators: { some: { id: userId } } }),
            ...(containsTrack && { tracks: { some: { id: containsTrack } } }),
          },
        ],
      },
      include: {
        ...rest,
        ...(collaborators && {
          collaborators: {
            select: {
              profile: true,
            },
          },
        }),
        ...(savedBy && {
          savedBy: {
            select: {
              user: {
                select: {
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
              profile: true,
            },
          },
        }),
        _count: {
          select: {
            savedBy: true,
            collaborators: true,
            tracks: true,
          },
        },
      },
      page,
      pageSize,
    });
    if (userId) {
      const savedPlaylists =
        await this.playlistsService.getSavedPlaylists(userId);
      res.items = res.items.map((playlist) => {
        playlist['isSaved'] = savedPlaylists.some((p) => p.id === playlist.id);
        return playlist;
      });
    }
    console.log(res.items.length, 'res.items.length');

    return res;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('tracks') tracks: boolean,
    @Query('collaborators') collaborators: boolean
  ) {
    const tracksBool = Boolean(tracks);
    const collaboratorsBool = Boolean(collaborators);

    return await this.playlistsService.findOne(id, {
      ...(tracksBool && {
        tracks: {
          select: {
            id: true,
            title: true,
            creator: {
              include: {
                profile: true,
              },
            },
            trackDuration: true,
            trackSize: true,
            src: true,
            cover: true,
          },
        },
      }),
      ...(collaboratorsBool && {
        collaborators: {
          select: {
            profile: true,
          },
        },
      }),
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UserRoles(Role.ARTIST, Role.MEMBER, Role.USER)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updatePlaylistDto: UpdatePlaylistDto,
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
    console.log(coverFile, 'coverFile');
    const { deleteCover, ...rest } = cleanObject(updatePlaylistDto);
    const payload: UpdatePlaylistPayload = {
      creatorId: req.user.id as string,
      ...rest,
    };
    const shouldDeleteCover = deleteCover === 'true';

    if (shouldDeleteCover) {
      await this.firebaseService.deleteFile({
        directory: FIREBASE_STORAGE_DIRS.PLAYLIST_COVER(id),
        fileName: id,
      });
      payload.cover = null;
    } else {
      if (coverFile) {
        await this.firebaseService.deleteFile({
          directory: FIREBASE_STORAGE_DIRS.PLAYLIST_COVER(id),
          fileName: id,
        });
        const coverUrl = await this.firebaseService.uploadFile({
          directory: FIREBASE_STORAGE_DIRS.PLAYLIST_COVER(id),
          fileBuffer: coverFile.buffer,
          fileName: id,
          fileType: 'image',
          originalFilename: coverFile.originalname,
        });
        console.log(coverUrl, 'coverUrl');
        payload.cover = coverUrl;
      }
    }

    const playlist = await this.playlistsService.update(id, payload);

    return playlist;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.id;
    return await this.playlistsService.remove(id, userId);
  }

  // To remove single track from multiple playlists
  @Post('remove-track/:trackId')
  @UseGuards(AuthGuard)
  async removeTrack(
    @Request() req,
    @Param('trackId') trackId: string,
    @Body('playlists') playlists: string[]
  ) {
    return this.playlistsService.removeTrackFromPlaylists({
      trackId,
      playlists,
      userId: req.user.id,
    });
  }

  // To add single track to multiple playlists
  @Post('add-track/:trackId')
  @UseGuards(AuthGuard)
  async addTrack(
    @Request() req,
    @Param('trackId') trackId: string,
    @Body('playlists') playlists: string[]
  ) {
    return this.playlistsService.addTrackToPlaylists({
      trackId,
      playlists,
      userId: req.user.id,
    });
  }

  // To remove multiple tracks from a playlist
  @Post('remove-tracks/:playlistId')
  @UseGuards(AuthGuard)
  async removeTracks(
    @Request() req,
    @Param('playlistId') playlistId: string,
    @Body('tracks') tracks: string[]
  ) {
    return this.playlistsService.removeTracksFromPlaylist({
      tracks,
      playlistId,
      userId: req.user.id,
    });
  }

  @Post('toggle-save/:playlistId')
  @UseGuards(AuthGuard)
  async toggleSave(@Request() req, @Param('playlistId') playlistId: string) {
    return this.playlistsService.toggleSave({
      playlistId,
      userId: req.user.id,
    });
  }
}
