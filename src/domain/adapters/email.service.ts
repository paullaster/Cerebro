export interface EmailMessage {
    to: string;
    subject: string;
    body: string;
    htmlBody?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType: string;
    }>;
}

export interface IEmailService {
    send(message: EmailMessage): Promise<{ messageId: string; accepted: boolean }>;
    sendTemplate(
        to: string,
        templateId: string,
        variables: Record<string, any>,
    ): Promise<{ messageId: string; accepted: boolean }>;
    validateEmail(email: string): Promise<boolean>;
}