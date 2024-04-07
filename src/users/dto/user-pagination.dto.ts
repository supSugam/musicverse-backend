import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/pagination/dto/pagination.dto';
import { ReviewStatus } from 'src/utils/enums/ReviewStatus';

export class UserPaginationDto extends BasePaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  artistStatus?: ReviewStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  isVerified?: boolean;
}
