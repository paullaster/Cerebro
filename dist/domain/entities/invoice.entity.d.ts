import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';
export declare enum InvoiceStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export declare class Invoice extends Entity<UUIDv7> {
    private collectionId;
    private amount;
    private status;
    private qrCodeUrl;
    private createdAt;
    private updatedAt;
    private constructor();
    static create(props: {
        collectionId: UUIDv7;
        amount: Money;
    }): Invoice;
    getCollectionId(): UUIDv7;
    getAmount(): Money;
    getStatus(): InvoiceStatus;
    getQrCodeUrl(): string | null;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    markAsPaid(): void;
    setQrCodeUrl(url: string): void;
    static reconstitute(props: {
        id: UUIDv7;
        collectionId: UUIDv7;
        amount: Money;
        status: InvoiceStatus;
        qrCodeUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): Invoice;
}
