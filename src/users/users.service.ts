import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

// async create(registerUserDto: RegisterUserDto): Promise<UserEntity> {
//   const { email, username, password, genreIds, role } = registerUserDto;
//   const user_role = role as UserRole;
//   // Check if the user already exists
//   const existingEmail = await this.prisma.user.findUnique({
//     where: { email },
//   });

//   if (existingEmail) {
//     throw new ConflictException('Email is already taken');
//   }

//   const existingUsername = await this.prisma.user.findUnique({
//     where: { username },
//   });
//   if (existingUsername) {
//     throw new ConflictException('Username is already taken');
//   }

//   const hashedPassword = await getHashedPassword(password);
//   const userData = {
//     email,
//     username,
//     password: hashedPassword,
//     role: user_role,
//   };

//   if (genreIds && genreIds.length > 0) {
//     const existingGenres = await this.prisma.genre.findMany({
//       where: {
//         id: {
//           in: genreIds,
//         },
//       },
//     });

//     if (existingGenres.length !== genreIds.length) {
//       throw new BadRequestException('Selected genres are invalid.');
//     }
//     userData['genres'] = {
//       connect: genreIds.map((genreId) => ({ id: genreId })),
//     };
//   }

//   const user = await this.prisma.user.create({
//     data: userData,
//     include: {
//       genres: true,
//     },
//   });

//   delete user.password;
//   return user;
// }

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.prisma.user.findMany();
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

    const updatedUserData = {
      username,
      email,
      role,
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
