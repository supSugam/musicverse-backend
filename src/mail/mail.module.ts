import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MailController],
  providers: [MailService, UsersService, PrismaService],
  exports: [MailService],
  imports: [ScheduleModule.forRoot(), UsersModule, PrismaModule],
})
export class MailModule {}
