import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'La contraseña actual es requerida' })
  currentPassword: string;

  @IsString({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
