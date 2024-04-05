import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { PaginationModule } from 'src/pagination/pagination.module';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [FirebaseModule, PrismaModule, PaginationModule],
  controllers: [NotificationsController],
  exports: [NotificationsService],
  providers: [NotificationsService],
})
export class NotificationsModule {}
