import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString({ message: 'La contraseña es requerida' })
  password: string;
}
