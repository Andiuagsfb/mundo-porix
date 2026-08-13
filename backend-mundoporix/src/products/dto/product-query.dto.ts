import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const SORT_FIELDS = ['name', 'price', 'createdAt', 'updatedAt'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

export class ProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un entero' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  @Max(100, { message: 'limit no puede exceder 100' })
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  seasonId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'minPrice no puede ser negativo' })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'maxPrice no puede ser negativo' })
  maxPrice?: number;

  @IsOptional()
  @IsBooleanString({ message: 'includeInactive debe ser true o false' })
  includeInactive?: string;

  @IsOptional()
  @IsIn(SORT_FIELDS, { message: 'sortBy no es válido' })
  sortBy?: (typeof SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(SORT_ORDERS, { message: 'sortOrder no es válido' })
  sortOrder?: (typeof SORT_ORDERS)[number];
}
