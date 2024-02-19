import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [AlbumsController],
  providers: [AlbumsService],
  imports: [AuthModule, PrismaModule, FirebaseModule],
})
export class AlbumsModule {}
