import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSeasonDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio no es válida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin no es válida' })
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
