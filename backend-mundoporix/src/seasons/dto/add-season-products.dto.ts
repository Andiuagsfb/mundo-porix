import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class AddSeasonProductsDto {
  @IsArray({ message: 'productIds debe ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto' })
  @IsString({ each: true, message: 'Cada productId debe ser un texto' })
  productIds: string[];
}
