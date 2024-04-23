import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [SeederService],
  imports: [PrismaModule],
  exports: [SeederService],
})
export class SeederModule {}
