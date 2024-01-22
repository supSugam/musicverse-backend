import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MailController],
  providers: [MailService, PrismaService],
  exports: [MailService],
  imports: [ScheduleModule.forRoot(), PrismaModule],
})
export class MailModule {}
