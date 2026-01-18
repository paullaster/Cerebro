import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { ICollectionRepository, DateRange } from '../../../domain/repositories/collection.repository.ts';
import { Collection, CollectionStatus, CollectionGrade } from '../../../domain/entities/collection.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { CollectionMapper } from '../mappers/collection.mapper.ts';
import { EntityNotFoundException } from '../../../domain/exceptions/domain.exception.ts';

import { Invoice } from '../../../domain/entities/invoice.entity';
import { InvoiceMapper } from '../mappers/invoice.mapper';

@Injectable()
export class PrismaCollectionRepository implements ICollectionRepository, OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    // ... existing onModuleInit

    async saveWithInvoice(collection: Collection, invoice: Invoice): Promise<void> {
        const colPersistence = CollectionMapper.toPersistence(collection);
        const invPersistence = InvoiceMapper.toPersistence(invoice);

        // We use $transaction with raw queries because tables are partitioned
        await this.prisma.$transaction(async (tx) => {
            // 1. Insert Collection
            await tx.$executeRaw`
                INSERT INTO collections (
                    id, store_agent_id, farmer_id, produce_type_id,
                    weight_kg, quality_grade, applied_rate, calculated_payout_amount,
                    status, notes, collected_at, verified_at,
                    created_at, updated_at, partition_date
                ) VALUES (
                    ${colPersistence.id}::uuid,
                    ${colPersistence.store_agent_id}::uuid,
                    ${colPersistence.farmer_id}::uuid,
                    ${colPersistence.produce_type_id}::uuid,
                    ${colPersistence.weight_kg},
                    ${colPersistence.quality_grade},
                    ${colPersistence.applied_rate},
                    ${colPersistence.calculated_payout_amount},
                    ${colPersistence.status},
                    ${colPersistence.notes},
                    ${colPersistence.collected_at},
                    ${colPersistence.verified_at},
                    ${colPersistence.created_at},
                    ${colPersistence.updated_at},
                    ${colPersistence.partition_date}
                )
             `;

            // 2. Insert Invoice
            await tx.$executeRaw`
                INSERT INTO invoices (
                    id, collection_id, amount, status, qr_code_url,
                    created_at, updated_at, partition_date
                ) VALUES (
                    ${invPersistence.id}::uuid,
                    ${invPersistence.collection_id}::uuid,
                    ${invPersistence.amount},
                    ${invPersistence.status},
                    ${invPersistence.qr_code_url},
                    ${invPersistence.created_at},
                    ${invPersistence.updated_at},
                    ${invPersistence.partition_date}
                )
             `;
        });
    }

    async findById(id: UUIDv7): Promise<Collection | null> {
        const result = await this.prisma.$queryRaw<Array<any>>`
      SELECT * FROM collections 
      WHERE id = ${id.toString()}::uuid
      LIMIT 1
    `;

        if (result.length === 0) {
            return null;
        }

        // Need to fetch relations separately due to partitioning
        const [agent, farmer, produce] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: result[0].store_agent_id } }),
            this.prisma.user.findUnique({ where: { id: result[0].farmer_id } }),
            this.prisma.produceType.findUnique({ where: { id: result[0].produce_type_id } }),
        ]);

        return CollectionMapper.toDomain({
            ...result[0],
            agent,
            farmer,
            produce,
        });
    }

    async save(collection: Collection): Promise<Collection> {
        const persistence = CollectionMapper.toPersistence(collection);

        // Use raw query for partitioned table
        const result = await this.prisma.$queryRaw<Array<any>>`
      INSERT INTO collections (
        id, store_agent_id, farmer_id, produce_type_id,
        weight_kg, quality_grade, applied_rate, calculated_payout_amount,
        status, notes, collected_at, verified_at,
        created_at, updated_at, partition_date
      ) VALUES (
        ${persistence.id}::uuid,
        ${persistence.store_agent_id}::uuid,
        ${persistence.farmer_id}::uuid,
        ${persistence.produce_type_id}::uuid,
        ${persistence.weight_kg},
        ${persistence.quality_grade},
        ${persistence.applied_rate},
        ${persistence.calculated_payout_amount},
        ${persistence.status},
        ${persistence.notes},
        ${persistence.collected_at},
        ${persistence.verified_at},
        ${persistence.created_at},
        ${persistence.updated_at},
        ${persistence.partition_date}
      )
      RETURNING *
    `;

        // Fetch relations
        const [agent, farmer, produce] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: persistence.store_agent_id } }),
            this.prisma.user.findUnique({ where: { id: persistence.farmer_id } }),
            this.prisma.produceType.findUnique({ where: { id: persistence.produce_type_id } }),
        ]);

        return CollectionMapper.toDomain({
            ...result[0],
            agent,
            farmer,
            produce,
        });
    }

    async bulkInsert(collections: Collection[]): Promise<void> {
        if (collections.length === 0) return;

        const values = collections.map(col => {
            const persistence = CollectionMapper.toPersistence(col);
            return `(
        '${persistence.id}',
        '${persistence.store_agent_id}',
        '${persistence.farmer_id}',
        '${persistence.produce_type_id}',
        ${persistence.weight_kg},
        '${persistence.quality_grade}',
        ${persistence.applied_rate},
        ${persistence.calculated_payout_amount},
        '${persistence.status}',
        ${persistence.notes ? `'${persistence.notes.replace(/'/g, "''")}'` : 'NULL'},
        '${persistence.collected_at.toISOString()}',
        ${persistence.verified_at ? `'${persistence.verified_at.toISOString()}'` : 'NULL'},
        '${persistence.created_at.toISOString()}',
        '${persistence.updated_at.toISOString()}',
        '${persistence.partition_date.toISOString().split('T')[0]}'
      )`;
        }).join(',');

        await this.prisma.$executeRawUnsafe(`
      INSERT INTO collections (
        id, store_agent_id, farmer_id, produce_type_id,
        weight_kg, quality_grade, applied_rate, calculated_payout_amount,
        status, notes, collected_at, verified_at,
        created_at, updated_at, partition_date
      ) VALUES ${values}
      ON CONFLICT (id) DO NOTHING
    `);
    }

    async getDailySummary(date: Date): Promise<{
        totalWeight: number;
        totalAmount: Money;
        count: number;
        byGrade: Record<CollectionGrade, { count: number; weight: number; amount: Money }>;
    }> {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const result = await this.prisma.$queryRaw<Array<any>>`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(weight_kg), 0) as total_weight,
        COALESCE(SUM(calculated_payout_amount), 0) as total_amount,
        quality_grade,
        COUNT(*) FILTER (WHERE quality_grade = 'A') as grade_a_count,
        COALESCE(SUM(weight_kg) FILTER (WHERE quality_grade = 'A'), 0) as grade_a_weight,
        COALESCE(SUM(calculated_payout_amount) FILTER (WHERE quality_grade = 'A'), 0) as grade_a_amount,
        COUNT(*) FILTER (WHERE quality_grade = 'B') as grade_b_count,
        COALESCE(SUM(weight_kg) FILTER (WHERE quality_grade = 'B'), 0) as grade_b_weight,
        COALESCE(SUM(calculated_payout_amount) FILTER (WHERE quality_grade = 'B'), 0) as grade_b_amount,
        COUNT(*) FILTER (WHERE quality_grade = 'C') as grade_c_count,
        COALESCE(SUM(weight_kg) FILTER (WHERE quality_grade = 'C'), 0) as grade_c_weight,
        COALESCE(SUM(calculated_payout_amount) FILTER (WHERE quality_grade = 'C'), 0) as grade_c_amount
      FROM collections 
      WHERE partition_date = ${start}
        AND status IN ('VERIFIED', 'PAID')
      GROUP BY quality_grade
    `;

        const summary = {
            totalWeight: 0,
            totalAmount: Money.zero(),
            count: 0,
            byGrade: {
                [CollectionGrade.A]: { count: 0, weight: 0, amount: Money.zero() },
                [CollectionGrade.B]: { count: 0, weight: 0, amount: Money.zero() },
                [CollectionGrade.C]: { count: 0, weight: 0, amount: Money.zero() },
            },
        };

        for (const row of result) {
            summary.totalWeight += parseFloat(row.total_weight) || 0;
            summary.totalAmount = summary.totalAmount.add(new Money(row.total_amount || 0));
            summary.count += parseInt(row.count) || 0;

            if (row.quality_grade === 'A') {
                summary.byGrade.A = {
                    count: parseInt(row.grade_a_count) || 0,
                    weight: parseFloat(row.grade_a_weight) || 0,
                    amount: new Money(row.grade_a_amount || 0),
                };
            } else if (row.quality_grade === 'B') {
                summary.byGrade.B = {
                    count: parseInt(row.grade_b_count) || 0,
                    weight: parseFloat(row.grade_b_weight) || 0,
                    amount: new Money(row.grade_b_amount || 0),
                };
            } else if (row.quality_grade === 'C') {
                summary.byGrade.C = {
                    count: parseInt(row.grade_c_count) || 0,
                    weight: parseFloat(row.grade_c_weight) || 0,
                    amount: new Money(row.grade_c_amount || 0),
                };
            }
        }

        return summary;
    }

    async getPartitionInfo(): Promise<Array<{
        partitionName: string;
        tableSpace: string;
        rowCount: number;
        size: string;
    }>> {
        return this.prisma.$queryRaw<Array<any>>`
      SELECT 
        child.relname as partition_name,
        pg_size_pretty(pg_total_relation_size(child.oid)) as size,
        (SELECT COUNT(*) FROM partitions.collections_y2024_m01) as row_count,
        spcname as table_space
      FROM pg_inherits
      JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
      JOIN pg_class child ON pg_inherits.inhrelid = child.oid
      LEFT JOIN pg_tablespace ts ON reltablespace = ts.oid
      WHERE parent.relname = 'collections'
      ORDER BY child.relname
    `;
    }
}