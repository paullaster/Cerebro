var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { CollectionGrade, } from '../../../domain/entities/collection.entity.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { CollectionMapper } from '../mappers/collection.mapper.ts';
import { InvoiceMapper } from '../mappers/invoice.mapper';
let PrismaCollectionRepository = class PrismaCollectionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveWithInvoice(collection, invoice) {
        const colPersistence = CollectionMapper.toPersistence(collection);
        const invPersistence = InvoiceMapper.toPersistence(invoice);
        await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw `
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
            await tx.$executeRaw `
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
    async findById(id) {
        const result = await this.prisma.$queryRaw `
      SELECT * FROM collections 
      WHERE id = ${id.toString()}::uuid
      LIMIT 1
    `;
        if (result.length === 0) {
            return null;
        }
        const [agent, farmer, produce] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: result[0].store_agent_id } }),
            this.prisma.user.findUnique({ where: { id: result[0].farmer_id } }),
            this.prisma.produceType.findUnique({
                where: { id: result[0].produce_type_id },
            }),
        ]);
        return CollectionMapper.toDomain({
            ...result[0],
            agent,
            farmer,
            produce,
        });
    }
    async save(collection) {
        const persistence = CollectionMapper.toPersistence(collection);
        const result = await this.prisma.$queryRaw `
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
        const [agent, farmer, produce] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: persistence.store_agent_id },
            }),
            this.prisma.user.findUnique({ where: { id: persistence.farmer_id } }),
            this.prisma.produceType.findUnique({
                where: { id: persistence.produce_type_id },
            }),
        ]);
        return CollectionMapper.toDomain({
            ...result[0],
            agent,
            farmer,
            produce,
        });
    }
    async bulkInsert(collections) {
        if (collections.length === 0)
            return;
        const values = collections
            .map((col) => {
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
        })
            .join(',');
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
    async getDailySummary(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        const result = await this.prisma.$queryRaw `
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
            }
            else if (row.quality_grade === 'B') {
                summary.byGrade.B = {
                    count: parseInt(row.grade_b_count) || 0,
                    weight: parseFloat(row.grade_b_weight) || 0,
                    amount: new Money(row.grade_b_amount || 0),
                };
            }
            else if (row.quality_grade === 'C') {
                summary.byGrade.C = {
                    count: parseInt(row.grade_c_count) || 0,
                    weight: parseFloat(row.grade_c_weight) || 0,
                    amount: new Money(row.grade_c_amount || 0),
                };
            }
        }
        return summary;
    }
    async getPartitionInfo() {
        return this.prisma.$queryRaw `
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
};
PrismaCollectionRepository = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PrismaCollectionRepository);
export { PrismaCollectionRepository };
//# sourceMappingURL=prisma-collection.repository.js.map