import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginationResult,
  getPaginationParams,
} from '../common/utils/pagination';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  quoteId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Registra auditoría dentro de una transacción existente. */
  async logTx(tx: Prisma.TransactionClient, entry: AuditEntry): Promise<void> {
    await tx.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        quoteId: entry.quoteId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata ?? Prisma.JsonNull,
      },
    });
  }

  /** Registra auditoría de forma autónoma. */
  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        quoteId: entry.quoteId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata ?? Prisma.JsonNull,
      },
    });
  }

  async findAll(
    page?: number,
    limit?: number,
    entity?: string,
    entityId?: string,
  ) {
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = getPaginationParams(page, limit);

    const where: Prisma.AuditLogWhereInput = {};
    if (entity) {
      where.entity = entity;
    }
    if (entityId) {
      where.entityId = entityId;
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return buildPaginationResult(rows, total, safePage, safeLimit);
  }
}
