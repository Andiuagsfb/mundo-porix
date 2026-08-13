import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from './inventory.service';
import { InsufficientStockException } from './insufficient-stock.exception';

describe('InventoryService — control transaccional de stock', () => {
  let service: InventoryService;
  let tx: {
    $executeRaw: jest.Mock;
    inventory: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    tx = {
      $executeRaw: jest.fn(),
      inventory: { findUnique: jest.fn() },
    };
    service = new InventoryService({} as PrismaService);
    jest.clearAllMocks();
  });

  describe('getAvailable', () => {
    it('calcula disponible = quantity - reservedQuantity (10 - 8 = 2)', async () => {
      tx.inventory.findUnique.mockResolvedValue({
        quantity: 10,
        reservedQuantity: 8,
      });
      await expect(service.getAvailable(tx as never, 'p1')).resolves.toBe(2);
    });

    it('retorna 0 si el producto no tiene inventario', async () => {
      tx.inventory.findUnique.mockResolvedValue(null);
      await expect(service.getAvailable(tx as never, 'p1')).resolves.toBe(0);
    });
  });

  describe('reserveStock', () => {
    it('reserva cuando hay disponibilidad suficiente (update afecta 1 fila)', async () => {
      tx.$executeRaw.mockResolvedValue(1);
      await expect(
        service.reserveStock(tx as never, 'p1', 2),
      ).resolves.toBeUndefined();
      expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('rechaza cuando se solicita más stock del disponible (10 → solicitud 11)', async () => {
      tx.$executeRaw.mockResolvedValue(0);
      tx.inventory.findUnique.mockResolvedValue({
        quantity: 10,
        reservedQuantity: 0,
      });
      await expect(
        service.reserveStock(tx as never, 'p1', 11),
      ).rejects.toBeInstanceOf(InsufficientStockException);
    });

    it('rechaza cuando la solicitud excede el disponible tras reservas previas (10, reserva 8, solicitud 2)', async () => {
      tx.$executeRaw.mockResolvedValue(0);
      tx.inventory.findUnique.mockResolvedValue({
        quantity: 10,
        reservedQuantity: 8,
      });
      await expect(
        service.reserveStock(tx as never, 'p1', 2),
      ).rejects.toBeInstanceOf(InsufficientStockException);
    });

    it('incluye los datos de la solicitud en la excepción', async () => {
      tx.$executeRaw.mockResolvedValue(0);
      tx.inventory.findUnique.mockResolvedValue({
        quantity: 10,
        reservedQuantity: 8,
      });
      await expect(
        service.reserveStock(tx as never, 'p1', 5),
      ).rejects.toMatchObject({
        productId: 'p1',
        requested: 5,
        available: 2,
      });
    });
  });
});
