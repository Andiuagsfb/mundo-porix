import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { $Enums } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuotesService } from '../quotes/quotes.service';

const ReservationStatus = $Enums.ReservationStatus;

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotesService: QuotesService,
  ) {}

  /**
   * Expira reservas vencidas: libera el inventario reservado y mueve la
   * cotización a EXPIRED. Ejecutado por el scheduler.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async expireReservations(): Promise<number> {
    const expired = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: { lte: new Date() },
      },
      select: { id: true, quoteId: true, expiresAt: true },
    });

    let released = 0;
    for (const reservation of expired) {
      try {
        await this.quotesService.expire(reservation.quoteId);
        released += 1;
      } catch (error) {
        this.logger.error(
          `No se pudo expirar la reserva ${reservation.id} (cotización ${reservation.quoteId})`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    if (expired.length > 0) {
      this.logger.log(
        `Expiración de reservas: ${released} de ${expired.length} liberadas`,
      );
    }

    return released;
  }
}
