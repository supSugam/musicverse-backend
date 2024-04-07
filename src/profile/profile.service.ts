import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICreateProfile, IUpdateProfile } from './profile.interface';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async create(createProfileDto: ICreateProfile) {
    return await this.prisma.profile.create({
      data: {
        name: createProfileDto.name,
        bio: createProfileDto.bio,
        user: {
          connect: { id: createProfileDto.userId },
        },
        avatar: createProfileDto.avatar,
        cover: createProfileDto.cover,
      },
    });
  }

  findAll() {
    return `This action returns all profile`;
  }

  async findOne(userId: string) {
    const isUserBanned = await this.prisma.bannedUser.findUnique({
      where: { id: userId },
    });

    if (isUserBanned) {
      throw new HttpException(
        'You have been banned, please contact support for more information',
        HttpStatus.FORBIDDEN
      );
    }

    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new HttpException(
        'You have not created your profile yet',
        HttpStatus.NOT_FOUND
      );
    }
    return profile;
  }

  async update(userId: string, updateProfileDto: IUpdateProfile) {
    return await this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
    });
  }

  remove(id: string) {
    return `This action removes a #${id} profile`;
  }
}
