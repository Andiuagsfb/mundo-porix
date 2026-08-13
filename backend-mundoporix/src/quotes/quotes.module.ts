import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { QuoteCalculatorService } from './services/quote-calculator.service';
import { QuoteNumberService } from './services/quote-number.service';
import { QuoteReservationService } from './services/quote-reservation.service';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [InventoryModule, NotificationsModule, AuditModule],
  controllers: [QuotesController],
  providers: [
    QuotesService,
    QuoteCalculatorService,
    QuoteNumberService,
    QuoteReservationService,
  ],
  exports: [QuotesService],
})
export class QuotesModule {}
