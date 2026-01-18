import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.ts';
import { Invoice } from '../../../domain/entities/invoice.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { InvoiceMapper } from '../mappers/invoice.mapper.ts';

@Injectable()
export class PrismaInvoiceRepository implements IInvoiceRepository, OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect();
    }

    async save(invoice: Invoice): Promise<Invoice> {
        const p = InvoiceMapper.toPersistence(invoice);

        const result = await this.prisma.$queryRaw<Array<any>>`
            INSERT INTO invoices (
                id, collection_id, amount, status, qr_code_url,
                created_at, updated_at, partition_date
            ) VALUES (
                ${p.id}::uuid,
                ${p.collection_id}::uuid,
                ${p.amount},
                ${p.status},
                ${p.qr_code_url},
                ${p.created_at},
                ${p.updated_at},
                ${p.partition_date}
            )
            RETURNING *
        `;

        return InvoiceMapper.toDomain(result[0]);
    }

    async findById(id: UUIDv7): Promise<Invoice | null> {
        const result = await this.prisma.$queryRaw<Array<any>>`
            SELECT * FROM invoices 
            WHERE id = ${id.toString()}::uuid
            LIMIT 1
        `;

        if (result.length === 0) return null;
        return InvoiceMapper.toDomain(result[0]);
    }

    async findByCollectionId(collectionId: UUIDv7): Promise<Invoice | null> {
        const result = await this.prisma.$queryRaw<Array<any>>`
            SELECT * FROM invoices 
            WHERE collection_id = ${collectionId.toString()}::uuid
            LIMIT 1
        `;

        if (result.length === 0) return null;
        return InvoiceMapper.toDomain(result[0]);
    }
}