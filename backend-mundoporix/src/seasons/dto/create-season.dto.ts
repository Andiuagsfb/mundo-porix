import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSeasonDto {
  @IsString({ message: 'El nombre es requerido' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsDateString({}, { message: 'La fecha de inicio no es válida' })
  startDate: string;

  @IsDateString({}, { message: 'La fecha de fin no es válida' })
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
