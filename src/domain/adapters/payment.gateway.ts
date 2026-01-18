import { Money } from '../value-objects/money.value-object.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';

export interface PaymentRequest {
    amount: Money;
    currency: string;
    customer: {
        phoneNumber?: string;
        email?: string;
        name?: string;
    };
    metadata?: Record<string, any>;
}

export interface PaymentResponse {
    transactionId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    providerReference?: string;
    message?: string;
}

export interface IPaymentGateway {
    initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
    checkStatus(transactionId: string): Promise<PaymentResponse>;
    refund(transactionId: string, amount?: Money): Promise<PaymentResponse>;

    // Webhook handling
    validateWebhook(payload: any, signature: string): boolean;
    parseWebhook(payload: any): {
        transactionId: string;
        amount: Money;
        status: string;
        metadata: Record<string, any>;
    };
}