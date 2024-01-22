import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CredentialsType } from 'src/utils/enums/Auth';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    const count = await this.prisma.user.count();
    return {
      users,
      count,
    };
  }

  findOne(usernameOrEmail: string, credentialsType: CredentialsType) {
    if (credentialsType === CredentialsType.EMAIL) {
      return this.prisma.user.findUnique({
        where: {
          email: usernameOrEmail,
        },
      });
    }
    return this.prisma.user.findUnique({
      where: {
        username: usernameOrEmail,
      },
    });
  }

  async findOneById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          genres: true,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (err) {
      throw new NotFoundException('User not found');
    }
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

  async remove(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.delete({
        where: { id },
      });
      return {
        message: 'User deleted successfully',
      };
    } catch (err) {
      throw new NotFoundException('User not found');
    }
  }

  async updateVerifiedStatus(email: string, status: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: status,
      },
    });
  }

  // TODO: Create Profile, Update Profile, Delete Profile
}
