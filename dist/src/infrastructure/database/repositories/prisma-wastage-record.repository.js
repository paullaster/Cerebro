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
import { WastageRecordMapper } from '../mappers/wastage-record.mapper.ts';
let PrismaWastageRecordRepository = class PrismaWastageRecordRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async save(wastageRecord) {
        const p = WastageRecordMapper.toPersistence(wastageRecord);
        const result = await this.prisma.$queryRaw `
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
    async findById(id) {
        const result = await this.prisma.$queryRaw `
            SELECT * FROM wastage_records 
            WHERE id = ${id.toString()}::uuid
            LIMIT 1
        `;
        if (result.length === 0)
            return null;
        return WastageRecordMapper.toDomain(result[0]);
    }
    async findByCollectionId(collectionId) {
        const result = await this.prisma.$queryRaw `
            SELECT * FROM wastage_records 
            WHERE collection_id = ${collectionId.toString()}::uuid
            LIMIT 1
        `;
        if (result.length === 0)
            return null;
        return WastageRecordMapper.toDomain(result[0]);
    }
    async findByAgentId(agentId, date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        const result = await this.prisma.$queryRaw `
            SELECT * FROM wastage_records 
            WHERE agent_id = ${agentId.toString()}::uuid
            AND declared_at >= ${start} AND declared_at <= ${end}
            AND partition_date = ${start}::date
        `;
        return result.map((row) => WastageRecordMapper.toDomain(row));
    }
};
PrismaWastageRecordRepository = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PrismaWastageRecordRepository);
export { PrismaWastageRecordRepository };
//# sourceMappingURL=prisma-wastage-record.repository.js.map