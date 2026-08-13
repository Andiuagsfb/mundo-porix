import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'El nombre es requerido' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'La descripción no puede exceder 2000 caracteres',
  })
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString({ message: 'El brandId es requerido' })
  @IsNotEmpty({ message: 'El brandId no puede estar vacío' })
  brandId: string;

  @IsString({ message: 'El categoryId es requerido' })
  @IsNotEmpty({ message: 'El categoryId no puede estar vacío' })
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'El stock inicial debe ser un entero' })
  @Min(0, { message: 'El stock inicial no puede ser negativo' })
  initialStock?: number;
}
