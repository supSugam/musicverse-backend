// pagination.module.ts
import { Global, Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  providers: [PaginationService],
  exports: [PaginationService],
  imports: [PrismaModule],
})
export class PaginationModule {}
