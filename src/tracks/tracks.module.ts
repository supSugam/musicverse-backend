import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TracksController],
  providers: [TracksService],
  imports: [PrismaModule, AuthModule],
  exports: [TracksService],
})
export class TracksModule {}
