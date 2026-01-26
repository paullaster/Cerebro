import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.ts';
import { Invoice } from '../../../domain/entities/invoice.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
export declare class PrismaInvoiceRepository implements IInvoiceRepository, OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    save(invoice: Invoice): Promise<Invoice>;
    findById(id: UUIDv7): Promise<Invoice | null>;
    findByCollectionId(collectionId: UUIDv7): Promise<Invoice | null>;
}
