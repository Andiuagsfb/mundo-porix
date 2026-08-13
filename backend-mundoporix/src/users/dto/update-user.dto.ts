import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { $Enums } from '../../generated/prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'El teléfono no puede exceder 30 caracteres' })
  phone?: string;

  @IsOptional()
  @IsEnum($Enums.RoleName, { message: 'El rol no es válido' })
  role?: $Enums.RoleName;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
