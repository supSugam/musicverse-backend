import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICreateProfile, IUpdateProfile } from './profile.interface';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async create(createProfileDto: ICreateProfile) {
    console.log(createProfileDto);
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
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    console.log(profile);
    if (!profile) {
      throw new HttpException(
        'No Profile Created for this user.',
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
