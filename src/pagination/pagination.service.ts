import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { SortOrder } from 'src/utils/enums/SortOrder.enum';

export type ModelNames =
  (typeof Prisma.ModelName)[keyof typeof Prisma.ModelName];

type PrismaOperations<ModelName extends ModelNames> =
  Prisma.TypeMap['model'][ModelName]['operations'];
type PrismaFindManyArgs<ModelName extends ModelNames> =
  PrismaOperations<ModelName>['findMany']['args'];

type PaginationOptions<ModelName extends ModelNames> = {
  modelName: ModelName;
  where?: PrismaFindManyArgs<ModelName>['where'];
  orderBy?: PrismaFindManyArgs<ModelName>['orderBy'];
  include?: PrismaFindManyArgs<ModelName>['include'];
} & BasePaginationDto;

@Injectable()
export class PaginationService {
  constructor(private readonly prismaService: PrismaService) {}

  async paginate<ModelName extends ModelNames>({
    page,
    pageSize,
    modelName,
    where,
    orderBy,
    include,
  }: PaginationOptions<ModelName>) {
    try {
      const db = this.prismaService[modelName as string];
      // This is equivalent to: this.prismaService.track (assuming modelName is 'track')

      if (!page || !pageSize) {
        const items = await db.findMany({
          where: where || {},
          orderBy: orderBy || {
            createdAt: 'asc',
          },
          include: include || {},
        });
        return {
          items,
          totalCount: items.length,
        };
      }

      const skip = (+page - 1) * +pageSize;

      const totalCount = await db.count({
        where,
      });

      const items = await db.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      });

      return {
        items,
        totalCount,
      };
    } catch (error) {
      throw new NotFoundException('Data not found', error);
    }
  }
}
