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
import { InvoiceMapper } from '../mappers/invoice.mapper.ts';
let PrismaInvoiceRepository = class PrismaInvoiceRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async save(invoice) {
        const p = InvoiceMapper.toPersistence(invoice);
        const result = await this.prisma.$queryRaw `
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
    async findById(id) {
        const result = await this.prisma.$queryRaw `
            SELECT * FROM invoices 
            WHERE id = ${id.toString()}::uuid
            LIMIT 1
        `;
        if (result.length === 0)
            return null;
        return InvoiceMapper.toDomain(result[0]);
    }
    async findByCollectionId(collectionId) {
        const result = await this.prisma.$queryRaw `
            SELECT * FROM invoices 
            WHERE collection_id = ${collectionId.toString()}::uuid
            LIMIT 1
        `;
        if (result.length === 0)
            return null;
        return InvoiceMapper.toDomain(result[0]);
    }
};
PrismaInvoiceRepository = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PrismaInvoiceRepository);
export { PrismaInvoiceRepository };
//# sourceMappingURL=prisma-invoice.repository.js.map