import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  findOne(id: string) {
    return `This action returns a ${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        genres: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { username, email, role, genreIds } = updateUserDto;
    const user_role = role as UserRole;

    const updatedUserData = {
      ...(username && { username }),
      ...(email && { email }),
      ...(user_role && { role: user_role }),
    };

    if (genreIds && genreIds.length > 0) {
      const existingGenres = await this.prisma.genre.findMany({
        where: {
          id: {
            in: genreIds,
          },
        },
      });

      if (existingGenres.length !== genreIds.length) {
        throw new NotFoundException('Selected genres are invalid.');
      }
      updatedUserData['genres'] = {
        connect: genreIds.map((genreId) => ({ id: genreId })),
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updatedUserData,
      include: {
        genres: true,
      },
    });

    delete updatedUser.password;
    return updatedUser;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
