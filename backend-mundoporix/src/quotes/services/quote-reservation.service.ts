import { Injectable } from '@nestjs/common';
import { InventoryService, TxClient } from '../../inventory/inventory.service';

export interface ReservationLine {
  productId: string;
  quantity: number;
}

@Injectable()
export class QuoteReservationService {
  constructor(private readonly inventoryService: InventoryService) {}

  /** Reserva stock para cada línea de la cotización dentro de la transacción. */
  async reserve(tx: TxClient, lines: ReservationLine[]): Promise<void> {
    for (const line of lines) {
      await this.inventoryService.reserveStock(
        tx,
        line.productId,
        line.quantity,
      );
    }
  }

  /** Libera stock reservado (cancelación o expiración). */
  async release(tx: TxClient, lines: ReservationLine[]): Promise<void> {
    for (const line of lines) {
      await this.inventoryService.releaseStock(
        tx,
        line.productId,
        line.quantity,
      );
    }
  }
}
