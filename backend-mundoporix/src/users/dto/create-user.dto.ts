import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { $Enums } from '../../generated/prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString({ message: 'El nombre completo es requerido' })
  @IsNotEmpty({ message: 'El nombre completo no puede estar vacío' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'El teléfono no puede exceder 30 caracteres' })
  phone?: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum($Enums.RoleName, { message: 'El rol no es válido' })
  role?: $Enums.RoleName;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
