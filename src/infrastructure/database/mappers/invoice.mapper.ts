import { Invoice, InvoiceStatus } from '../../../domain/entities/invoice.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';

export class InvoiceMapper {
    static toDomain(raw: any): Invoice {
        if (!raw) return null;

        return Invoice.reconstitute({
            id: new UUIDv7(raw.id),
            collectionId: new UUIDv7(raw.collection_id),
            amount: new Money(raw.amount),
            status: raw.status as InvoiceStatus,
            qrCodeUrl: raw.qr_code_url,
            createdAt: new Date(raw.created_at),
            updatedAt: new Date(raw.updated_at),
        });
    }

    static toPersistence(entity: Invoice): any {
        return {
            id: entity.getId().toString(),
            collection_id: entity.getCollectionId().toString(),
            amount: entity.getAmount().getAmount(),
            status: entity.getStatus(),
            qr_code_url: entity.getQrCodeUrl(),
            created_at: entity.getCreatedAt(),
            updated_at: entity.getUpdatedAt(),
            partition_date: entity.getCreatedAt(), // Partition by created_at
        };
    }
}