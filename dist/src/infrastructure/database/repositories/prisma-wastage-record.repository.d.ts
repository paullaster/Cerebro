import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IWastageRecordRepository } from '../../../domain/repositories/wastage-record.repository.ts';
import { WastageRecord } from '../../../domain/entities/wastage-record.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
export declare class PrismaWastageRecordRepository implements IWastageRecordRepository, OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    save(wastageRecord: WastageRecord): Promise<WastageRecord>;
    findById(id: UUIDv7): Promise<WastageRecord | null>;
    findByCollectionId(collectionId: UUIDv7): Promise<WastageRecord | null>;
    findByAgentId(agentId: UUIDv7, date: Date): Promise<WastageRecord[]>;
}
