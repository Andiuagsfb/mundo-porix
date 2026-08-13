import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuotesService } from '../quotes/quotes.service';
import { $Enums } from '../generated/prisma/client';
import type { QuoteStatus } from '../quotes/domain/quote-status';

const QuoteStatusEnum = $Enums.QuoteStatus;

@Injectable()
export class PickupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotesService: QuotesService,
  ) {}

  listPending() {
    return this.prisma.pickup.findMany({
      where: {
        quote: {
          status: {
            in: [QuoteStatusEnum.PREPARING, QuoteStatusEnum.READY_FOR_PICKUP],
          },
        },
      },
      include: {
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            customerName: true,
            customerPhone: true,
            pickupDate: true,
            status: true,
            total: true,
            items: {
              select: { quantity: true },
            },
          },
        },
      },
      orderBy: { quote: { pickupDate: 'asc' } },
    });
  }

  async transition(quoteId: string, to: QuoteStatus, userId?: string) {
    return this.quotesService.transition(quoteId, to, userId);
  }

  prepare(quoteId: string, userId?: string) {
    return this.transition(quoteId, QuoteStatusEnum.PREPARING, userId);
  }

  ready(quoteId: string, userId?: string) {
    return this.transition(quoteId, QuoteStatusEnum.READY_FOR_PICKUP, userId);
  }

  complete(quoteId: string, userId?: string) {
    return this.transition(quoteId, QuoteStatusEnum.PICKED_UP, userId);
  }
}
