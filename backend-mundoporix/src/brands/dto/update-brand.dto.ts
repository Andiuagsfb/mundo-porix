import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;
}
