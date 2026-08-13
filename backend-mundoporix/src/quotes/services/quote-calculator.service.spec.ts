import { Prisma } from '../../generated/prisma/client';
import { QuoteCalculatorService } from './quote-calculator.service';

describe('QuoteCalculatorService', () => {
  let service: QuoteCalculatorService;

  beforeEach(() => {
    service = new QuoteCalculatorService();
  });

  it('calcula el subtotal como precio × cantidad', () => {
    const subtotal = service.calculateItemSubtotal(
      new Prisma.Decimal('5000'),
      3,
    );
    expect(subtotal.toString()).toBe('15000');
  });

  it('redondea el subtotal a 2 decimales', () => {
    const subtotal = service.calculateItemSubtotal(
      new Prisma.Decimal('333.331'),
      3,
    );
    expect(subtotal.toString()).toBe('999.99');
  });

  it('calcula el total sumando todos los subtotales', () => {
    const items = [
      {
        productId: 'a',
        quantity: 2,
        unitPrice: new Prisma.Decimal('1000'),
        subtotal: new Prisma.Decimal('2000'),
      },
      {
        productId: 'b',
        quantity: 1,
        unitPrice: new Prisma.Decimal('500'),
        subtotal: new Prisma.Decimal('500'),
      },
      {
        productId: 'c',
        quantity: 4,
        unitPrice: new Prisma.Decimal('250'),
        subtotal: new Prisma.Decimal('1000'),
      },
    ];

    expect(service.calculateTotal(items).toString()).toBe('3500');
  });

  it('devuelve 0 cuando no hay items', () => {
    expect(service.calculateTotal([]).toString()).toBe('0');
  });

  it('congela el precio histórico: el total de una cotización no cambia si el precio del producto cambia', () => {
    const priceAtQuoteTime = new Prisma.Decimal('5000');
    const newProductPrice = new Prisma.Decimal('6000');

    const quoteSubtotal = service.calculateItemSubtotal(priceAtQuoteTime, 3);
    expect(quoteSubtotal.toString()).toBe('15000');

    expect(service.calculateItemSubtotal(newProductPrice, 3).toString()).toBe(
      '18000',
    );

    expect(quoteSubtotal.toString()).toBe('15000');
  });
});
