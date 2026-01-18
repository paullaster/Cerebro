import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';

export enum InvoiceStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
}

export class Invoice extends Entity<UUIDv7> {
    private collectionId: UUIDv7;
    private amount: Money;
    private status: InvoiceStatus;
    private qrCodeUrl: string | null;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: UUIDv7,
        collectionId: UUIDv7,
        amount: Money,
        status: InvoiceStatus,
        qrCodeUrl: string | null,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id);
        this.collectionId = collectionId;
        this.amount = amount;
        this.status = status;
        this.qrCodeUrl = qrCodeUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static create(props: {
        collectionId: UUIDv7;
        amount: Money;
    }): Invoice {
        if (props.amount.isLessThan(Money.zero())) {
            throw new Error('Invoice amount cannot be negative');
        }

        const now = new Date();
        return new Invoice(
            UUIDv7.generate(),
            props.collectionId,
            props.amount,
            InvoiceStatus.PENDING,
            null,
            now,
            now
        );
    }

    // Getters
    getCollectionId(): UUIDv7 { return this.collectionId; }
    getAmount(): Money { return this.amount; }
    getStatus(): InvoiceStatus { return this.status; }
    getQrCodeUrl(): string | null { return this.qrCodeUrl; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }

    // Logic
    markAsPaid(): void {
        this.status = InvoiceStatus.PAID;
        this.updatedAt = new Date();
    }

    setQrCodeUrl(url: string): void {
        this.qrCodeUrl = url;
        this.updatedAt = new Date();
    }

    static reconstitute(props: {
        id: UUIDv7;
        collectionId: UUIDv7;
        amount: Money;
        status: InvoiceStatus;
        qrCodeUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): Invoice {
        return new Invoice(
            props.id,
            props.collectionId,
            props.amount,
            props.status,
            props.qrCodeUrl,
            props.createdAt,
            props.updatedAt
        );
    }
}