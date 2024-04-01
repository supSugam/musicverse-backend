// pagination.module.ts
import { Global, Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginationController } from './pagination.controller';

@Global()
@Module({
  providers: [PaginationService],
  exports: [PaginationService],
  imports: [PrismaModule],
  controllers: [PaginationController],
})
export class PaginationModule {}
