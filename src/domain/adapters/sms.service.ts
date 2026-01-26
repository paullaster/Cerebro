export interface SmsMessage {
  to: string;
  body: string;
  from?: string;
}

export interface ISmsService {
  send(message: SmsMessage): Promise<{ messageId: string; status: string }>;
  sendBulk(
    messages: SmsMessage[],
  ): Promise<Array<{ messageId: string; status: string }>>;
  getBalance(): Promise<number>;
}
