import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [FirebaseModule, PrismaModule, PaginationModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
