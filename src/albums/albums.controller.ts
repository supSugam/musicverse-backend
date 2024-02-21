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

@Controller('albums')
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly firebaseService: FirebaseService
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
    console.log('payload', payload);
    console.log('coverFile', coverFile);

    const album = await this.albumsService.create(payload);

    if (coverFile) {
      const coverUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.ALBUM_COVER(album.id),
        fileName: album.id,
        fileBuffer: coverFile.buffer,
        originalFilename: coverFile.originalname,
        fileType: 'image',
      });

      return await this.albumsService.update(album.id, { cover: coverUrl });
    }

    return album;
  }

  @Get()
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    return this.albumsService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UserRoles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.albumsService.remove(id);
    return { message: ['Album deleted successfully'] };
  }
  @Delete()
  @UseGuards(AuthGuard)
  @UserRoles(Role.ADMIN)
  async removeAll() {
    await this.albumsService.removeAll();
    return { message: ['All albums deleted successfully'] };
  }
}
