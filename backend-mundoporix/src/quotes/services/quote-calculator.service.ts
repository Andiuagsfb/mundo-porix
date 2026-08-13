import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

export interface CalculatedItem {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  subtotal: Prisma.Decimal;
}

@Injectable()
export class QuoteCalculatorService {
  calculateItemSubtotal(
    unitPrice: Prisma.Decimal,
    quantity: number,
  ): Prisma.Decimal {
    return unitPrice.mul(quantity).toDecimalPlaces(2);
  }

  calculateTotal(items: CalculatedItem[]): Prisma.Decimal {
    return items
      .reduce((acc, item) => acc.plus(item.subtotal), new Prisma.Decimal(0))
      .toDecimalPlaces(2);
  }
}
