import { BadRequestException } from '@nestjs/common';
import { $Enums } from '../../generated/prisma/client';
import { assertCanTransition, canTransition } from './quote-status';

const Q = $Enums.QuoteStatus;

describe('Máquina de estados de cotizaciones', () => {
  it('permite todas las transiciones válidas', () => {
    expect(canTransition(Q.NEW, Q.RESERVED)).toBe(true);
    expect(canTransition(Q.NEW, Q.CANCELLED)).toBe(true);
    expect(canTransition(Q.RESERVED, Q.PREPARING)).toBe(true);
    expect(canTransition(Q.RESERVED, Q.EXPIRED)).toBe(true);
    expect(canTransition(Q.RESERVED, Q.CANCELLED)).toBe(true);
    expect(canTransition(Q.PREPARING, Q.READY_FOR_PICKUP)).toBe(true);
    expect(canTransition(Q.PREPARING, Q.CANCELLED)).toBe(true);
    expect(canTransition(Q.READY_FOR_PICKUP, Q.PICKED_UP)).toBe(true);
  });

  it('rechaza transiciones inválidas', () => {
    expect(canTransition(Q.NEW, Q.PICKED_UP)).toBe(false);
    expect(canTransition(Q.PICKED_UP, Q.NEW)).toBe(false);
    expect(canTransition(Q.PICKED_UP, Q.PREPARING)).toBe(false);
    expect(canTransition(Q.PICKED_UP, Q.RESERVED)).toBe(false);
    expect(canTransition(Q.CANCELLED, Q.RESERVED)).toBe(false);
    expect(canTransition(Q.CANCELLED, Q.NEW)).toBe(false);
    expect(canTransition(Q.CANCELLED, Q.PREPARING)).toBe(false);
    expect(canTransition(Q.EXPIRED, Q.RESERVED)).toBe(false);
    expect(canTransition(Q.EXPIRED, Q.READY_FOR_PICKUP)).toBe(false);
  });

  it('assertCanTransition lanza BadRequestException en transición inválida', () => {
    expect(() => assertCanTransition(Q.PICKED_UP, Q.NEW)).toThrow(
      BadRequestException,
    );
    expect(() => assertCanTransition(Q.NEW, Q.PICKED_UP)).toThrow(
      BadRequestException,
    );
    expect(() => assertCanTransition(Q.CANCELLED, Q.RESERVED)).toThrow(
      BadRequestException,
    );
  });

  it('assertCanTransition no lanza en transición válida', () => {
    expect(() => assertCanTransition(Q.RESERVED, Q.PREPARING)).not.toThrow();
    expect(() =>
      assertCanTransition(Q.READY_FOR_PICKUP, Q.PICKED_UP),
    ).not.toThrow();
  });
});
