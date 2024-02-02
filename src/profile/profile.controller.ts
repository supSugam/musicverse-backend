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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.decorator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FIREBASE_STORAGE_DIRS } from 'src/utils/constants';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly paginationService: PaginationService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @Post()
  @UseGuards(AuthGuard)
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
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const userId = req.user.id;

    const payload = {
      userId,
      name: createProfileDto.name,
    };

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === 'avatar') {
          const avatarUrl = await this.firebaseService.uploadFile({
            directory: FIREBASE_STORAGE_DIRS.USER_AVATAR(userId),
            fileName: userId,
            fileBuffer: file.buffer,
            originalFilename: file.originalname,
            fileType: 'image',
          });
          payload['avatar'] = avatarUrl;
        } else if (file.fieldname === 'cover') {
          const coverUrl = await this.firebaseService.uploadFile({
            directory: FIREBASE_STORAGE_DIRS.USER_COVER(userId),
            fileName: userId,
            fileBuffer: file.buffer,
            originalFilename: file.originalname,
            fileType: 'image',
          });
          payload['cover'] = coverUrl;
        }
      }
    }

    return await this.profileService.create(payload);
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
        .addFileTypeValidator({
          fileType: 'image',
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
          message: 'File size exceeds 2MB',
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    )
    files: { avatar?: Express.Multer.File; cover?: Express.Multer.File }
  ) {
    const userId = req.user.id;

    const { name, bio } = updateProfileDto;
    const avatarFile = files['avatar'];
    const coverFile = files['cover'];
    console.log('avatarFile', avatarFile);
    console.log('coverFile', coverFile);

    const payload = {
      ...(name && { name: name }),
      ...(bio && { bio: bio }),
    };

    // FIXME: Fix yar

    if (avatarFile) {
      const avatarUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.USER_AVATAR(userId),
        fileName: userId,
        fileBuffer: avatarFile.buffer,
        originalFilename: avatarFile.originalname,
        fileType: 'image',
      });
      payload['avatar'] = avatarUrl;
    }
    if (coverFile) {
      const coverUrl = await this.firebaseService.uploadFile({
        directory: FIREBASE_STORAGE_DIRS.USER_COVER(userId),
        fileName: userId,
        fileBuffer: coverFile.buffer,
        originalFilename: coverFile.originalname,
        fileType: 'image',
      });
      payload['cover'] = coverUrl;
    }
    console.log('payload', payload);
    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('No valid data found for update.');
    }

    return await this.profileService.update(userId, payload);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req) {
    return this.profileService.remove(req['user'].id);
  }
}
