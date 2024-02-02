import { Injectable } from '@nestjs/common';
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

  findOne(id: string) {
    return `This action returns a #${id} profile`;
  }

  async update(id: string, updateProfileDto: IUpdateProfile) {
    return await this.prisma.profile.update({
      where: { id },
      data: updateProfileDto,
    });
  }

  remove(id: string) {
    return `This action removes a #${id} profile`;
  }
}
