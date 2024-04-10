import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationType, UserRole } from '@prisma/client';
import { CredentialsType } from 'src/utils/enums/Auth';
import { isUUID } from 'class-validator';
import { FollowPayload } from 'src/notifications/payload.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';

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

  async findOneByUserIdOrUsername(idOrUsername: string, userId?: string) {
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

    if (userId) {
      const isFollowing = await this.prisma.user.findFirst({
        where: {
          id: userId,
          following: {
            some: {
              id: user.id,
            },
          },
        },
      });

      user['isFollowing'] = !!isFollowing;
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
      // ...(user_role && { role: user_role }),
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

      updatedUserData['genres'] = {
        connect: existingGenres.map((genre) => ({ id: genre.id })),
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

  async updateArtistStatus(id: string, status: ReviewStatus) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        artistStatus: status,
        ...(status === ReviewStatus.APPROVED
          ? { role: UserRole.ARTIST }
          : { role: UserRole.USER }), // TODO: Remove this line
      },
    });
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAuthorized = await this.prisma.user
      .findFirst({
        where: {
          id: currentUserId,
        },
      })
      .then((user) => user.role === UserRole.ADMIN || user.id === id);

    if (!isAuthorized) {
      throw new NotFoundException('Unauthorized');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  async toggleBanUser(id: string, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        bannedUsers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isBanned = user.bannedUsers.length > 0;

    if (isBanned) {
      await this.prisma.bannedUser.delete({
        where: { userId: id },
      });
      return {
        message: 'User Unbanned',
      };
    } else {
      await this.prisma.bannedUser.create({
        data: {
          userId: id,
          reason,
        },
      });
      return {
        message: 'User Banned',
      };
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
    if (userId === followUserId) {
      throw new NotFoundException('You cannot follow yourself');
    }
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

  async registerDeviceToken(userId: string, deviceToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check if device token already exists
    const existingDevice = await this.prisma.userDevice.findFirst({
      where: {
        deviceToken,
      },
    });

    if (existingDevice.userId === userId) {
      return {
        message: 'Device token already registered',
      };
    } else {
      await this.prisma.userDevice.delete({
        where: {
          deviceToken,
        },
      });

      await this.prisma.userDevice.create({
        data: {
          deviceToken,
          userId,
        },
      });
      return {
        message: 'Device token registered successfully',
      };
    }
  }

  async deregisterDeviceToken(userId: string, deviceToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingDevice = await this.prisma.userDevice.findFirst({
      where: {
        deviceToken,
      },
    });

    if (!existingDevice) {
      throw new NotFoundException('Device token not found');
    }

    await this.prisma.userDevice.delete({
      where: {
        deviceToken,
      },
    });

    return {
      message: 'Device token deregistered successfully',
    };
  }

  // TODO: Create Profile, Update Profile, Delete Profile
}
