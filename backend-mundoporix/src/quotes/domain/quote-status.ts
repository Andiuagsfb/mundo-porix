import { BadRequestException } from '@nestjs/common';
import { $Enums } from '../../generated/prisma/client';

export type QuoteStatus = $Enums.QuoteStatus;

/**
 * Máquina de estados de las cotizaciones.
 *
 * NEW
 *  ├── CANCELLED
 *  ▼
 * RESERVED
 *  ├── EXPIRED
 *  ├── CANCELLED
 *  ▼
 * PREPARING
 *  ├── CANCELLED
 *  ▼
 * READY_FOR_PICKUP
 *  ▼
 * PICKED_UP
 */
export const QUOTE_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  NEW: ['RESERVED', 'CANCELLED'],
  RESERVED: ['PREPARING', 'EXPIRED', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['PICKED_UP'],
  PICKED_UP: [],
  CANCELLED: [],
  EXPIRED: [],
};

export function canTransition(from: QuoteStatus, to: QuoteStatus): boolean {
  return QUOTE_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertCanTransition(from: QuoteStatus, to: QuoteStatus): void {
  if (!canTransition(from, to)) {
    throw new BadRequestException(
      `Transición de estado no permitida: ${from} → ${to}`,
    );
  }
}
