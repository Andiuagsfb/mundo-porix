import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationMessage,
  NotificationProvider,
} from './notification-provider.interface';

@Injectable()
export class WhatsAppProvider implements NotificationProvider {
  readonly name = 'WhatsAppProvider';
  readonly channel = 'whatsapp' as const;
  private readonly logger = new Logger(WhatsAppProvider.name);

  send(message: NotificationMessage): Promise<void> {
    this.logger.log(`[whatsapp → ${message.to}] ${message.body}`);
    return Promise.resolve();
  }
}
