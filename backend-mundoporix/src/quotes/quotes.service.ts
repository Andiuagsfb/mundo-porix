import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';
import { assertCanTransition, QuoteStatus } from './domain/quote-status';
import { QuoteCalculatorService } from './services/quote-calculator.service';
import { QuoteNumberService } from './services/quote-number.service';
import { QuoteReservationService } from './services/quote-reservation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import {
  buildPaginationResult,
  getPaginationParams,
} from '../common/utils/pagination';

const QuoteStatusEnum = $Enums.QuoteStatus;
const ReservationStatus = $Enums.ReservationStatus;
const PickupStatus = $Enums.PickupStatus;

const quoteInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, slug: true, imageUrl: true } },
    },
  },
  reservation: true,
  pickup: true,
  createdBy: { select: { id: true, fullName: true, email: true } },
} satisfies Prisma.QuoteInclude;

export type QuoteWithRelations = Prisma.QuoteGetPayload<{
  include: typeof quoteInclude;
}>;

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly quoteNumberService: QuoteNumberService,
    private readonly quoteCalculatorService: QuoteCalculatorService,
    private readonly quoteReservationService: QuoteReservationService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Flujo de creación: validar productos → precios oficiales de BD (nunca del
   * cliente) → calcular total → transacción (Quote + Items + reserva stock +
   * Reservation + Pickup) → notificación.
   */
  async create(
    dto: CreateQuoteDto,
    userId?: string,
  ): Promise<QuoteWithRelations> {
    const productIds = dto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: [...new Set(productIds)] }, isActive: true },
      select: { id: true, name: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const id of productIds) {
      if (!productMap.has(id)) {
        throw new BadRequestException(
          'Uno o más productos no existen o están inactivos',
        );
      }
    }

    const calculatedItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = product.price;
      const subtotal = this.quoteCalculatorService.calculateItemSubtotal(
        unitPrice,
        item.quantity,
      );
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    const total = this.quoteCalculatorService.calculateTotal(calculatedItems);
    const pickupDate = new Date(dto.pickupDate);
    if (pickupDate.getTime() <= Date.now()) {
      throw new BadRequestException(
        'La fecha de recogida debe ser posterior a la fecha actual',
      );
    }

    const expirationHours =
      this.config.get<number>('reservationExpirationHours') ?? 24;

    const quote = await this.prisma.$transaction(async (tx) => {
      assertCanTransition(QuoteStatusEnum.NEW, QuoteStatusEnum.RESERVED);

      const quoteNumber = await this.quoteNumberService.generate(tx);

      const created = await tx.quote.create({
        data: {
          quoteNumber,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          pickupDate,
          notes: dto.notes,
          status: QuoteStatusEnum.NEW,
          total,
          createdById: userId ?? null,
        },
      });

      await tx.quoteItem.createMany({
        data: calculatedItems.map((item) => ({
          quoteId: created.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      });

      await this.quoteReservationService.reserve(tx, calculatedItems);

      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
      await tx.reservation.create({
        data: {
          quoteId: created.id,
          status: ReservationStatus.ACTIVE,
          expiresAt,
        },
      });
      await tx.pickup.create({
        data: { quoteId: created.id, status: PickupStatus.PENDING },
      });

      await tx.quote.update({
        where: { id: created.id },
        data: { status: QuoteStatusEnum.RESERVED },
      });

      await this.auditService.logTx(tx, {
        userId,
        action: 'QUOTE_CREATED',
        entity: 'Quote',
        entityId: created.id,
        quoteId: created.id,
        metadata: {
          quoteNumber,
          status: 'RESERVED',
          total: total.toString(),
        },
      });

      return tx.quote.findUniqueOrThrow({
        where: { id: created.id },
        include: quoteInclude,
      });
    });

    await this.notificationsService.sendQuoteCreated({
      quoteNumber: quote.quoteNumber,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      status: quote.status,
      total: quote.total.toString(),
    });
    return quote;
  }

  async findByQuoteNumber(quoteNumber: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { quoteNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, imageUrl: true },
            },
          },
        },
        reservation: {
          select: { status: true, reservedAt: true, expiresAt: true },
        },
      },
    });
    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }
    return quote;
  }

  async findAll(query: QuoteQueryDto) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: Prisma.QuoteWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search } },
        { quoteNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.from || query.to) {
      where.pickupDate = {};
      if (query.from) {
        where.pickupDate.gte = new Date(query.from);
      }
      if (query.to) {
        where.pickupDate.lte = new Date(query.to);
      }
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.quote.findMany({
        where,
        include: quoteInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quote.count({ where }),
    ]);

    return buildPaginationResult(rows, total, page, limit);
  }

  async findById(id: string): Promise<QuoteWithRelations> {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: quoteInclude,
    });
    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }
    return quote;
  }

  /**
   * Única vía para cambiar el estado de una cotización.
   * Valida la transición y aplica efectos secundarios (inventario, reserva,
   * recogida) de forma transaccional.
   */
  async transition(
    id: string,
    to: QuoteStatus,
    userId?: string,
    options: { allowFrom?: QuoteStatus[] } = {},
  ): Promise<QuoteWithRelations> {
    const quote = await this.findById(id);
    const from = quote.status;

    if (options.allowFrom && !options.allowFrom.includes(from)) {
      throw new BadRequestException(
        `La cotización no se encuentra en un estado válido (${from})`,
      );
    }

    assertCanTransition(from, to);

    await this.prisma.$transaction(async (tx) => {
      await this.applyTransitionSideEffects(tx, quote, to);
      await tx.quote.update({ where: { id }, data: { status: to } });

      await this.auditService.logTx(tx, {
        userId,
        action: 'QUOTE_STATUS_CHANGED',
        entity: 'Quote',
        entityId: id,
        quoteId: id,
        metadata: { from, to },
      });
    });

    const updated = await this.findById(id);
    await this.notificationsService.sendQuoteStatusChanged({
      quoteNumber: updated.quoteNumber,
      customerName: updated.customerName,
      customerPhone: updated.customerPhone,
      status: updated.status,
      total: updated.total.toString(),
    });
    return updated;
  }

  async cancel(id: string, userId?: string): Promise<QuoteWithRelations> {
    return this.transition(id, QuoteStatusEnum.CANCELLED, userId, {
      allowFrom: [
        QuoteStatusEnum.NEW,
        QuoteStatusEnum.RESERVED,
        QuoteStatusEnum.PREPARING,
      ],
    });
  }

  /** Expiración automática de cotizaciones con reserva vencida. */
  async expire(id: string, userId?: string): Promise<QuoteWithRelations> {
    return this.transition(id, QuoteStatusEnum.EXPIRED, userId, {
      allowFrom: [QuoteStatusEnum.RESERVED],
    });
  }

  private async applyTransitionSideEffects(
    tx: Prisma.TransactionClient,
    quote: QuoteWithRelations,
    to: QuoteStatus,
  ): Promise<void> {
    switch (to) {
      case QuoteStatusEnum.PREPARING: {
        await tx.pickup.updateMany({
          where: { quoteId: quote.id },
          data: { preparedAt: new Date() },
        });
        break;
      }
      case QuoteStatusEnum.PICKED_UP: {
        await tx.pickup.updateMany({
          where: { quoteId: quote.id },
          data: { status: PickupStatus.COMPLETED, pickedUpAt: new Date() },
        });
        await tx.reservation.updateMany({
          where: { quoteId: quote.id },
          data: { status: ReservationStatus.COMPLETED },
        });
        break;
      }
      case QuoteStatusEnum.CANCELLED:
      case QuoteStatusEnum.EXPIRED: {
        await this.quoteReservationService.release(
          tx,
          quote.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        );
        await tx.reservation.updateMany({
          where: { quoteId: quote.id },
          data: {
            status:
              to === QuoteStatusEnum.EXPIRED
                ? ReservationStatus.EXPIRED
                : ReservationStatus.RELEASED,
            releasedAt: new Date(),
          },
        });
        await tx.pickup.updateMany({
          where: { quoteId: quote.id },
          data: { status: PickupStatus.CANCELLED },
        });
        break;
      }
      default:
        break;
    }
  }
}
