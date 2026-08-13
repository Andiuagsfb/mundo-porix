import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'La descripción no puede exceder 2000 caracteres',
  })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El brandId no puede estar vacío' })
  brandId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El categoryId no puede estar vacío' })
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
