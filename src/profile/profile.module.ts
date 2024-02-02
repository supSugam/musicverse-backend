import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [PrismaModule, FirebaseModule],
})
export class ProfileModule {}
