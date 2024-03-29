import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ValidationPipe,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Delete,
  ParseFilePipe,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipeBuilder,
  HttpException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { BasePaginationQueryParams } from 'src/pagination/dto/pagination.decorator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ALLOWED_IMAGE_MIMETYPES,
  FIREBASE_STORAGE_DIRS,
} from 'src/utils/constants';
import { ApiConsumes } from '@nestjs/swagger';
import { CustomUploadFileValidator } from 'src/app.validator';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly paginationService: PaginationService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ])
  )
  async create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createProfileDto: CreateProfileDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileValidator({
            avatar: {
              fileTypes: ALLOWED_IMAGE_MIMETYPES,
              maxFileSize: 1024 * 1024 * 2,
            },
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
      avatar?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    }
  ) {
    const userId = req.user.id;
    const payload = {
      ...createProfileDto,
      userId,
    };
    const avatar = files?.avatar?.[0];
    if (avatar) {
      const avatarUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.USER_AVATAR(userId),
        fileName: userId,
        fileBuffer: avatar.buffer,
        originalFilename: avatar.originalname,
        fileType: 'image',
      });
      payload['avatar'] = avatarUrl;
    }
    const cover = files?.cover?.[0];
    if (cover) {
      const coverUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.USER_COVER(userId),
        fileName: userId,
        fileBuffer: cover.buffer,
        originalFilename: cover.originalname,
        fileType: 'image',
      });
      payload['cover'] = coverUrl;
    }
    return await this.profileService.create(payload);
  }

  @Get()
  async findAll(
    @BasePaginationQueryParams(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    )
    params: BasePaginationDto
  ) {
    return await this.paginationService.paginate<'Profile'>({
      modelName: 'Profile',
      ...params,
    });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async findMe(@Request() req) {
    return await this.profileService.findOne(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ])
  )
  async update(
    @Request() req,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateProfileDto: UpdateProfileDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileValidator({
            avatar: {
              fileTypes: ALLOWED_IMAGE_MIMETYPES,
              maxFileSize: 1024 * 1024 * 2,
            },
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
      avatar?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    }
  ) {
    const userId = req.user.id;
    const payload = {
      ...(updateProfileDto.name && { name: updateProfileDto.name }),
      ...(updateProfileDto.bio && { bio: updateProfileDto.bio }),
    };
    const avatar = files?.avatar?.[0];
    if (avatar) {
      const avatarUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.USER_AVATAR(userId),
        fileName: userId,
        fileBuffer: avatar.buffer,
        originalFilename: avatar.originalname,
        fileType: 'image',
      });
      payload['avatar'] = avatarUrl;
    }
    const cover = files?.cover?.[0];
    if (cover) {
      const coverUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.USER_COVER(userId),
        fileName: userId,
        fileBuffer: cover.buffer,
        originalFilename: cover.originalname,
        fileType: 'image',
      });
      payload['cover'] = coverUrl;
    }
    if (Object.keys(payload).length === 0) {
      return { message: 'No changes detected.' };
    }
    return this.profileService.update(userId, payload);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req) {
    return this.profileService.remove(req['user'].id);
  }
}
