import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { getHashedPassword } from 'src/utils/helpers/Hasher';
import { UserRole } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async create(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    const { email, username, password, genreIds, role } = registerUserDto;
    const user_role = role as UserRole;
    // Check if the user already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already taken');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const hashedPassword = await getHashedPassword(password);
    const userData = {
      email,
      username,
      password: hashedPassword,
      role: user_role,
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
        throw new BadRequestException('Selected genres are invalid.');
      }
      userData['genres'] = {
        connect: genreIds.map((genreId) => ({ id: genreId })),
      };
    }

    const user = await this.prisma.user.create({
      data: userData,
      include: {
        genres: true,
      },
    });

    delete user.password;
    return user;
  }
}
