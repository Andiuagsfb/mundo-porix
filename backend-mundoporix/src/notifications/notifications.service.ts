import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';

export interface QuoteNotificationData {
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: string;
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'creada',
  RESERVED: 'confirmada (productos reservados)',
  PREPARING: 'en preparación',
  READY_FOR_PICKUP: 'lista para recoger',
  PICKED_UP: 'recogida',
  CANCELLED: 'cancelada',
  EXPIRED: 'expirada',
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly emailProvider: EmailProvider,
    private readonly whatsappProvider: WhatsAppProvider,
  ) {}

  async sendQuoteCreated(quote: QuoteNotificationData): Promise<void> {
    if (!this.enabled()) return;
    const subject = `Cotización ${quote.quoteNumber} creada`;
    const body =
      `Hola ${quote.customerName}, tu cotización ${quote.quoteNumber} fue generada ` +
      `por ${quote.total}. Los productos quedaron reservados.`;

    await Promise.allSettled([
      this.whatsappProvider.send({
        to: quote.customerPhone,
        body,
        channel: 'whatsapp',
      }),
      this.emailProvider.send({
        to: quote.customerPhone,
        subject,
        body,
        channel: 'email',
      }),
    ]);
  }

  async sendQuoteStatusChanged(quote: QuoteNotificationData): Promise<void> {
    if (!this.enabled()) return;
    const label = STATUS_LABELS[quote.status] ?? quote.status;
    const subject = `Cotización ${quote.quoteNumber}: ${label}`;
    const body = `Hola ${quote.customerName}, tu cotización ${quote.quoteNumber} está ${label}.`;

    await Promise.allSettled([
      this.whatsappProvider.send({
        to: quote.customerPhone,
        body,
        channel: 'whatsapp',
      }),
      this.emailProvider.send({
        to: quote.customerPhone,
        subject,
        body,
        channel: 'email',
      }),
    ]);
  }

  private enabled(): boolean {
    return this.config.get<boolean>('notificationsEnabled') ?? false;
  }
}
