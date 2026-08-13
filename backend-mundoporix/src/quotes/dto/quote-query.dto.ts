import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { $Enums } from '../../generated/prisma/client';

export class QuoteQueryDto {
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
  @IsEnum($Enums.QuoteStatus, { message: 'El estado no es válido' })
  status?: $Enums.QuoteStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString({}, { message: 'from no es una fecha válida' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'to no es una fecha válida' })
  to?: string;
}
