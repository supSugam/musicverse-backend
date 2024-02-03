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
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.decorator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FIREBASE_STORAGE_DIRS } from 'src/utils/constants';
import { ApiConsumes } from '@nestjs/swagger';
import { IsValidFile } from 'src/utils/helpers/Files';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ])
  )
  uploadFile(
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    }
  ) {
    const avatar = files.avatar[0];
    // const [cover] = files.cover;
    console.log(avatar);
    if (avatar) {
      IsValidFile({
        file: avatar,
        maxSize: 2 * 1024 * 1024,
        allowedExtensions: ['jpg', 'jpeg', 'png'],
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
      });
    }
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req) {
    return this.profileService.remove(req['user'].id);
  }
}
