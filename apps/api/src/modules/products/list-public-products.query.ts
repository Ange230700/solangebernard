import type { ListPublicProductsQuery } from '@repo/contracts';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { MAX_PUBLIC_PRODUCTS_PAGE_SIZE } from './products.types';

export class ListPublicProductsQueryDto implements ListPublicProductsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PUBLIC_PRODUCTS_PAGE_SIZE)
  pageSize?: number;

  @IsOptional()
  @Transform(({ value }) => normalizeCategory(value))
  @IsString()
  @MinLength(1)
  category?: string;
}

function normalizeCategory(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : '';
}
