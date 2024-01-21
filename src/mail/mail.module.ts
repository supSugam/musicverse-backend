import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
  imports: [ScheduleModule.forRoot()],
})
export class MailModule {}
