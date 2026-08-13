import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';

@Module({
  providers: [NotificationsService, EmailProvider, WhatsAppProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
