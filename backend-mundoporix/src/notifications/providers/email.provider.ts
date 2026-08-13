import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationMessage,
  NotificationProvider,
} from './notification-provider.interface';

@Injectable()
export class EmailProvider implements NotificationProvider {
  readonly name = 'EmailProvider';
  readonly channel = 'email' as const;
  private readonly logger = new Logger(EmailProvider.name);

  send(message: NotificationMessage): Promise<void> {
    this.logger.log(
      `[email → ${message.to}] ${message.subject} — ${message.body}`,
    );
    return Promise.resolve();
  }
}
