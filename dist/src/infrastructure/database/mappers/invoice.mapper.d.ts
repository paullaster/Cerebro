import { Invoice } from '../../../domain/entities/invoice.entity.ts';
export declare class InvoiceMapper {
    static toDomain(raw: any): Invoice;
    static toPersistence(entity: Invoice): any;
}
