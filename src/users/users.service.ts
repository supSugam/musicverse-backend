import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationType, UserRole } from '@prisma/client';
import { CredentialsType } from 'src/utils/enums/Auth';
import { isUUID } from 'class-validator';
import { FollowPayload } from 'src/notifications/payload.type';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

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

  async findOneByUserIdOrUsername(idOrUsername: string) {
    const isId = isUUID(idOrUsername);

    const user = await this.prisma.user.findUnique({
      where: {
        ...(isId ? { id: idOrUsername } : { username: idOrUsername }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        artistStatus: true,
        profile: true,
        _count: {
          select: {
            albums: true,
            tracks: true,
            playlists: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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
      // isVerified: true, // TODO: Remove this line
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

  async toggleFollow(userId: string, followUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFollowing = user.following.some((u) => u.id === followUserId);

    if (isFollowing) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            disconnect: {
              id: followUserId,
            },
          },
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            connect: {
              id: followUserId,
            },
          },
        },
      });
      this.eventEmitter.emit(NotificationType.FOLLOW, {
        followerId: userId,
        followingId: followUserId,
      } as FollowPayload);
    }

    return {
      message: isFollowing
        ? 'Unfollowed successfully'
        : 'Followed successfully',
    };
  }

  // TODO: Create Profile, Update Profile, Delete Profile
}
