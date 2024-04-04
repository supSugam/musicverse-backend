import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [FirebaseModule, PrismaModule],
})
export class NotificationsModule {}
