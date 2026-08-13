import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
  imports: [QuotesModule],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
