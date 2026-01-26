import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import { Collection, CollectionGrade } from '../../../domain/entities/collection.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { Invoice } from '../../../domain/entities/invoice.entity';
export declare class PrismaCollectionRepository implements ICollectionRepository, OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    saveWithInvoice(collection: Collection, invoice: Invoice): Promise<void>;
    findById(id: UUIDv7): Promise<Collection | null>;
    save(collection: Collection): Promise<Collection>;
    bulkInsert(collections: Collection[]): Promise<void>;
    getDailySummary(date: Date): Promise<{
        totalWeight: number;
        totalAmount: Money;
        count: number;
        byGrade: Record<CollectionGrade, {
            count: number;
            weight: number;
            amount: Money;
        }>;
    }>;
    getPartitionInfo(): Promise<Array<{
        partitionName: string;
        tableSpace: string;
        rowCount: number;
        size: string;
    }>>;
}
