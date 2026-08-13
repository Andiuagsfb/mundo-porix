import { Injectable } from '@nestjs/common';
import { TxClient } from '../../inventory/inventory.service';

@Injectable()
export class QuoteNumberService {
  /** Genera números secuenciales y atómicos: COT-2026-000001 */
  async generate(tx: TxClient, date: Date = new Date()): Promise<string> {
    const year = date.getFullYear();
    const rows = await tx.$queryRaw<Array<{ next: bigint }>>`
      SELECT nextval('quote_number_seq') AS next
    `;
    const seq = Number(rows[0].next);
    return `COT-${year}-${String(seq).padStart(6, '0')}`;
  }
}
