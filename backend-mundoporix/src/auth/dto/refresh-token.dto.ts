import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'El refresh token es requerido' })
  @IsNotEmpty({ message: 'El refresh token no puede estar vacío' })
  refreshToken: string;
}
