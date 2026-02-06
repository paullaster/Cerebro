import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { user_role, verification_statuses } from '../../../generated/prisma/enums.js';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(user_role)
  role?: user_role;

  @IsOptional()
  @IsEnum(verification_statuses)
  verification_status?: verification_statuses;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
