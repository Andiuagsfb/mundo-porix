import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InsufficientStockException } from './insufficient-stock.exception';
import {
  buildPaginationResult,
  getPaginationParams,
} from '../common/utils/pagination';

export type TxClient = Prisma.TransactionClient;

const inventoryProductInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      isActive: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.InventoryInclude;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getStock(tx: TxClient, productId: string) {
    const inventory = await tx.inventory.findUnique({ where: { productId } });
    return {
      quantity: inventory?.quantity ?? 0,
      reservedQuantity: inventory?.reservedQuantity ?? 0,
      availableQuantity: inventory
        ? inventory.quantity - inventory.reservedQuantity
        : 0,
    };
  }

  async getAvailable(tx: TxClient, productId: string): Promise<number> {
    const inventory = await tx.inventory.findUnique({ where: { productId } });
    return inventory ? inventory.quantity - inventory.reservedQuantity : 0;
  }

  /**
   * Reserva unidades de forma atómica (UPDATE condicional).
   * Evita el oversell bajo concurrencia: la fila solo se actualiza si hay
   * disponibilidad suficiente.
   */
  async reserveStock(
    tx: TxClient,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const result = await tx.$executeRaw`
      UPDATE "inventory"
      SET "reservedQuantity" = "reservedQuantity" + ${quantity},
          "updatedAt" = ${new Date()}
      WHERE "productId" = ${productId}
        AND ("quantity" - "reservedQuantity") >= ${quantity}
    `;

    if (result === 0) {
      const available = await this.getAvailable(tx, productId);
      throw new InsufficientStockException(productId, quantity, available);
    }
  }

  /** Libera unidades reservadas (devolución atómica de inventario). */
  async releaseStock(
    tx: TxClient,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await tx.$executeRaw`
      UPDATE "inventory"
      SET "reservedQuantity" = "reservedQuantity" - ${quantity},
          "updatedAt" = ${new Date()}
      WHERE "productId" = ${productId}
        AND "reservedQuantity" >= ${quantity}
    `;
  }

  async findAll(page?: number, limit?: number) {
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = getPaginationParams(page, limit);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.inventory.findMany({
        include: inventoryProductInclude,
        orderBy: { product: { name: 'asc' } },
        skip,
        take: safeLimit,
      }),
      this.prisma.inventory.count(),
    ]);

    const data = rows.map((row) => ({
      id: row.id,
      product: row.product,
      quantity: row.quantity,
      reservedQuantity: row.reservedQuantity,
      availableQuantity: row.quantity - row.reservedQuantity,
      updatedAt: row.updatedAt,
    }));

    return buildPaginationResult(data, total, safePage, safeLimit);
  }

  async findByProductId(productId: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: inventoryProductInclude,
    });
    if (!inventory) {
      throw new NotFoundException('Inventario no encontrado para el producto');
    }
    return {
      id: inventory.id,
      product: inventory.product,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity: inventory.quantity - inventory.reservedQuantity,
      updatedAt: inventory.updatedAt,
    };
  }

  async adjustQuantity(productId: string, quantity: number) {
    if (quantity < 0) {
      throw new ConflictException('La cantidad no puede ser negativa');
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });

      if (!inventory) {
        throw new NotFoundException(
          'Inventario no encontrado para el producto',
        );
      }

      if (quantity < inventory.reservedQuantity) {
        throw new ConflictException(
          'La cantidad no puede ser menor que las unidades reservadas',
        );
      }

      return tx.inventory.update({
        where: { productId },
        data: { quantity },
        include: inventoryProductInclude,
      });
    });
  }
}
