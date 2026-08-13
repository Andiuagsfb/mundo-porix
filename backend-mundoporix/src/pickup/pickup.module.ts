import { Module } from '@nestjs/common';
import { PickupService } from './pickup.service';
import { PickupController } from './pickup.controller';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
  imports: [QuotesModule],
  controllers: [PickupController],
  providers: [PickupService],
})
export class PickupModule {}
