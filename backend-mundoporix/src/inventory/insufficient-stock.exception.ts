import { ConflictException } from '@nestjs/common';

export class InsufficientStockException extends ConflictException {
  constructor(
    readonly productId: string,
    readonly requested: number,
    readonly available: number,
  ) {
    super(
      `Stock insuficiente para el producto (solicitado: ${requested}, disponible: ${available})`,
    );
    this.name = 'InsufficientStockException';
  }
}
