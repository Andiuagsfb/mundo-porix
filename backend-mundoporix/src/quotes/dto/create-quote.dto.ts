import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateQuoteItemDto {
  @IsString({ message: 'El productId es requerido' })
  @IsNotEmpty({ message: 'El productId no puede estar vacío' })
  productId: string;

  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;
}

export class CreateQuoteDto {
  @IsString({ message: 'El nombre del cliente es requerido' })
  @IsNotEmpty({ message: 'El nombre del cliente no puede estar vacío' })
  @MaxLength(150, {
    message: 'El nombre del cliente no puede exceder 150 caracteres',
  })
  customerName: string;

  @IsString({ message: 'El teléfono es requerido' })
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío' })
  @MaxLength(30, { message: 'El teléfono no puede exceder 30 caracteres' })
  @Matches(/^[+0-9 ()-]+$/, { message: 'El teléfono no es válido' })
  customerPhone: string;

  @IsDateString({}, { message: 'La fecha de recogida no es válida' })
  pickupDate: Date;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notes?: string;

  @IsArray({ message: 'items debe ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}
