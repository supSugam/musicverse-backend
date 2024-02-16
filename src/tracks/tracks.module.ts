import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [TracksController],
  providers: [TracksService],
  imports: [PrismaModule, AuthModule, FirebaseModule],
  exports: [TracksService],
})
export class TracksModule {}
