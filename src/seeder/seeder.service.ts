// 1. seeder.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_NAME,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_USERNAME,
} from 'src/utils/constants';
import { getHashedPassword } from 'src/utils/helpers/Hasher';
import { UserRole } from 'src/utils/enums/User';

@Injectable()
export class SeederService {
  constructor(private readonly prismaService: PrismaService) {}

  async seedAdmin(): Promise<void> {
    const adminExists = await this.prismaService.user.findFirst({
      where: {
        username: SUPER_ADMIN_USERNAME,
      },
    });
    const hashedPassword = await getHashedPassword(SUPER_ADMIN_PASSWORD);

    if (!adminExists) {
      // Create the admin user
      const admin = await this.prismaService.user.create({
        data: {
          username: SUPER_ADMIN_USERNAME,
          email: SUPER_ADMIN_EMAIL,
          password: hashedPassword,
          role: UserRole.ADMIN,
          isVerified: true,
        },
      });
      // Create Profile

      await this.prismaService.profile.create({
        data: {
          name: SUPER_ADMIN_NAME,
          user: {
            connect: {
              id: admin.id,
            },
          },
        },
      });
    }
    console.log(`
    ╔═════════════════════════════╗
    ║     Super Admin Seeded      ║
    ╠═════════════════════════════╣
    ║ Username: ${SUPER_ADMIN_USERNAME}             ║
    ║ Email: ${SUPER_ADMIN_EMAIL} ║
    ║ Password: ${SUPER_ADMIN_PASSWORD}        ║
    ╚═════════════════════════════╝
  `);
  }
}
