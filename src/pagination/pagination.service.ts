// pagination.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';

@Injectable()
export class PaginationService {
  constructor(private readonly prismaService: PrismaService) {}

  async paginate(params: BasePaginationDto & { modelName: string }) {
    try {
      const { page, pageSize, search, modelName, sortOrder } = params;

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },

              // Add more search conditions as needed
            ],
          }
        : {};

      if (!page || !pageSize) {
        const items = await this.prismaService[modelName].findMany({
          ...(search && { where }),
        });
        return {
          items,
          totalCount: items.length,
        };
      }

      const skip = (+page - 1) * +pageSize;

      const orderBy = {
        // Assuming 'createdAt' as a sorting field. Customize as needed.
        createdAt: sortOrder,
      };

      const items = await this.prismaService[modelName].findMany({
        skip,
        take: +pageSize,
        where,
        orderBy,
      });

      return {
        items,
        totalCount: items.length,
      };
    } catch (error) {
      throw error;
    }
  }
}
