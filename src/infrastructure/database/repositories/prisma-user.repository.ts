import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import { User, UserRole } from '../../../domain/entities/user.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Email } from '../../../domain/value-objects/email.value-object.ts';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.value-object.ts';
import { UserMapper } from '../mappers/user.mapper.ts';

@Injectable()
export class PrismaUserRepository implements IUserRepository, OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect();
    }

    async findById(id: UUIDv7): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({
            where: { id: id.toString() },
        });
        return UserMapper.toDomain(raw);
    }

    async findByEmail(email: Email): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({
            where: { email: email.getValue() },
        });
        return UserMapper.toDomain(raw);
    }

    async findByPhone(phoneNumber: PhoneNumber): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({
            where: { phone_number: phoneNumber.getValue() },
        });
        return UserMapper.toDomain(raw);
    }

    async findByNationalId(nationalId: string): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({
            where: { national_id: nationalId },
        });
        return UserMapper.toDomain(raw);
    }

    async save(user: User): Promise<User> {
        const data = UserMapper.toPersistence(user);

        // Check if exists
        const exists = await this.prisma.user.findUnique({
            where: { id: data.id }
        });

        let result;
        if (exists) {
            result = await this.prisma.user.update({
                where: { id: data.id },
                data: data
            });
        } else {
            result = await this.prisma.user.create({
                data: data
            });
        }

        return UserMapper.toDomain(result);
    }

    async update(user: User): Promise<User> {
        return this.save(user);
    }

    async delete(id: UUIDv7): Promise<void> {
        await this.prisma.user.delete({
            where: { id: id.toString() },
        });
    }

    // List operations
    async listByRole(role: UserRole, options?: {
        page?: number;
        limit?: number;
        verified?: boolean;
    }): Promise<{ users: User[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { role };
        if (options?.verified !== undefined) {
            where.verification_status = options.verified ? 'VERIFIED' : { not: 'VERIFIED' };
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

    async listAgentsByRegion(region: string, options?: {
        page?: number;
        limit?: number;
        verifiedOnly?: boolean;
    }): Promise<{ users: User[]; total: number }> {
        // This requires geospatial query on Agent table joined with User.
        // Assuming region is a simple filter for now or unimplemented as complex geo logic requires PostGIS setup verification.
        // For now, returning empty implementation or basic filter if region is a string field (it's polygon in schema).
        return { users: [], total: 0 };
    }

    // Existence checks
    async existsByEmail(email: Email): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email: email.getValue() },
        });
        return count > 0;
    }

    async existsByPhone(phoneNumber: PhoneNumber): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { phone_number: phoneNumber.getValue() },
        });
        return count > 0;
    }

    async existsByNationalId(nationalId: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { national_id: nationalId },
        });
        return count > 0;
    }

    // Count operations
    async countByRole(role: UserRole): Promise<number> {
        return this.prisma.user.count({
            where: { role },
        });
    }

    async countByVerificationStatus(status: string): Promise<number> {
        return this.prisma.user.count({
            where: { verification_status: status as any },
        });
    }

    // Search operations
    async search(query: string, options?: {
        role?: UserRole;
        page?: number;
        limit?: number;
    }): Promise<{ users: User[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {
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
}