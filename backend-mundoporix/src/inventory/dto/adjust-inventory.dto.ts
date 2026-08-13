import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AdjustInventoryDto {
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  quantity: number;
}
