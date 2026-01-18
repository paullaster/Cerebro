import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IWastageRecordRepository } from '../../../domain/repositories/wastage-record.repository.ts';
import { WastageRecord } from '../../../domain/entities/wastage-record.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { WastageRecordMapper } from '../mappers/wastage-record.mapper.ts';

@Injectable()
export class PrismaWastageRecordRepository implements IWastageRecordRepository, OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect();
    }

    async save(wastageRecord: WastageRecord): Promise<WastageRecord> {
        const p = WastageRecordMapper.toPersistence(wastageRecord);

        const result = await this.prisma.$queryRaw<Array<any>>`
            INSERT INTO wastage_records (
                id, collection_id, agent_id, produce_type_id,
                weight_kg, reason, declared_at,
                created_at, updated_at, partition_date
            ) VALUES (
                ${p.id}::uuid,
                ${p.collection_id}::uuid,
                ${p.agent_id}::uuid,
                ${p.produce_type_id}::uuid,
                ${p.weight_kg},
                ${p.reason},
                ${p.declared_at},
                ${p.created_at},
                ${p.updated_at},
                ${p.partition_date}
            )
            RETURNING *
        `;

        return WastageRecordMapper.toDomain(result[0]);
    }

    async findById(id: UUIDv7): Promise<WastageRecord | null> {
        const result = await this.prisma.$queryRaw<Array<any>>`
            SELECT * FROM wastage_records 
            WHERE id = ${id.toString()}::uuid
            LIMIT 1
        `;

        if (result.length === 0) return null;
        return WastageRecordMapper.toDomain(result[0]);
    }

    async findByCollectionId(collectionId: UUIDv7): Promise<WastageRecord | null> {
        const result = await this.prisma.$queryRaw<Array<any>>`
            SELECT * FROM wastage_records 
            WHERE collection_id = ${collectionId.toString()}::uuid
            LIMIT 1
        `;

        if (result.length === 0) return null;
        return WastageRecordMapper.toDomain(result[0]);
    }

    async findByAgentId(agentId: UUIDv7, date: Date): Promise<WastageRecord[]> {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        // Partition pruning happens automatically by Postgres if we filter by partition_date (which is derived from declared_at)
        const result = await this.prisma.$queryRaw<Array<any>>`
            SELECT * FROM wastage_records 
            WHERE agent_id = ${agentId.toString()}::uuid
            AND declared_at >= ${start} AND declared_at <= ${end}
            AND partition_date = ${start}::date
        `;

        return result.map(row => WastageRecordMapper.toDomain(row));
    }
}