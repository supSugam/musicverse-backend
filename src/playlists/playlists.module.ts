import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  imports: [PrismaModule, AuthModule, FirebaseModule],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
