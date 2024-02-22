import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from '../../utils/enums/SortOrder.enum';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class BasePaginationDto {
  @ApiProperty()
  @IsNumberString({ no_symbols: true }, { message: 'Page must be a number.' })
  @IsOptional()
  page?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumberString(
    { no_symbols: true },
    { message: 'Page size must be a number.' }
  )
  pageSize?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be ASC or DESC' })
  sortOrder?: SortOrder = SortOrder.ASC;
}
