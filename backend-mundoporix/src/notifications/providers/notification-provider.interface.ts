export type NotificationChannel = 'email' | 'whatsapp';

export interface NotificationMessage {
  to: string;
  subject?: string;
  body: string;
  channel: NotificationChannel;
}

export interface NotificationProvider {
  readonly name: string;
  readonly channel: NotificationChannel;
  send(message: NotificationMessage): Promise<void>;
}
