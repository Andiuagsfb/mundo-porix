import { IsEnum } from 'class-validator';
import { $Enums } from '../../generated/prisma/client';

export class UpdateQuoteStatusDto {
  @IsEnum($Enums.QuoteStatus, { message: 'El estado no es válido' })
  status: $Enums.QuoteStatus;
}
