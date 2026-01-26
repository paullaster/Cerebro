import { Invoice } from '../entities/invoice.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export interface IInvoiceRepository {
    save(invoice: Invoice): Promise<Invoice>;
    findById(id: UUIDv7): Promise<Invoice | null>;
    findByCollectionId(collectionId: UUIDv7): Promise<Invoice | null>;
}
