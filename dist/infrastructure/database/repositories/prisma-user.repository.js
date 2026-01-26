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
import { UserMapper } from '../mappers/user.mapper.ts';
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async findById(id) {
        const raw = await this.prisma.user.findUnique({
            where: { id: id.toString() },
        });
        return UserMapper.toDomain(raw);
    }
    async findByEmail(email) {
        const raw = await this.prisma.user.findUnique({
            where: { email: email.getValue() },
        });
        return UserMapper.toDomain(raw);
    }
    async findByPhone(phoneNumber) {
        const raw = await this.prisma.user.findUnique({
            where: { phone_number: phoneNumber.getValue() },
        });
        return UserMapper.toDomain(raw);
    }
    async findByNationalId(nationalId) {
        const raw = await this.prisma.user.findUnique({
            where: { national_id: nationalId },
        });
        return UserMapper.toDomain(raw);
    }
    async save(user) {
        const data = UserMapper.toPersistence(user);
        const exists = await this.prisma.user.findUnique({
            where: { id: data.id },
        });
        let result;
        if (exists) {
            result = await this.prisma.user.update({
                where: { id: data.id },
                data: data,
            });
        }
        else {
            result = await this.prisma.user.create({
                data: data,
            });
        }
        return UserMapper.toDomain(result);
    }
    async update(user) {
        return this.save(user);
    }
    async delete(id) {
        await this.prisma.user.delete({
            where: { id: id.toString() },
        });
    }
    async listByRole(role, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        const where = { role };
        if (options?.verified !== undefined) {
            where.verification_status = options.verified
                ? 'VERIFIED'
                : { not: 'VERIFIED' };
        }
        const [total, result] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
        ]);
        return {
            users: result.map(UserMapper.toDomain),
            total,
        };
    }
    async listAgentsByRegion(region, options) {
        return { users: [], total: 0 };
    }
    async existsByEmail(email) {
        const count = await this.prisma.user.count({
            where: { email: email.getValue() },
        });
        return count > 0;
    }
    async existsByPhone(phoneNumber) {
        const count = await this.prisma.user.count({
            where: { phone_number: phoneNumber.getValue() },
        });
        return count > 0;
    }
    async existsByNationalId(nationalId) {
        const count = await this.prisma.user.count({
            where: { national_id: nationalId },
        });
        return count > 0;
    }
    async countByRole(role) {
        return this.prisma.user.count({
            where: { role },
        });
    }
    async countByVerificationStatus(status) {
        return this.prisma.user.count({
            where: { verification_status: status },
        });
    }
    async search(query, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            OR: [
                { email: { contains: query, mode: 'insensitive' } },
                { phone_number: { contains: query, mode: 'insensitive' } },
                { national_id: { contains: query, mode: 'insensitive' } },
            ],
        };
        if (options?.role) {
            where.role = options.role;
        }
        const [total, result] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
        ]);
        return {
            users: result.map(UserMapper.toDomain),
            total,
        };
    }
};
PrismaUserRepository = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PrismaUserRepository);
export { PrismaUserRepository };
//# sourceMappingURL=prisma-user.repository.js.map