import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import { User, UserRole } from '../../../domain/entities/user.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Email } from '../../../domain/value-objects/email.value-object.ts';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.value-object.ts';
export declare class PrismaUserRepository implements IUserRepository, OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findById(id: UUIDv7): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    findByPhone(phoneNumber: PhoneNumber): Promise<User | null>;
    findByNationalId(nationalId: string): Promise<User | null>;
    save(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(id: UUIDv7): Promise<void>;
    listByRole(role: UserRole, options?: {
        page?: number;
        limit?: number;
        verified?: boolean;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    listAgentsByRegion(region: string, options?: {
        page?: number;
        limit?: number;
        verifiedOnly?: boolean;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    existsByEmail(email: Email): Promise<boolean>;
    existsByPhone(phoneNumber: PhoneNumber): Promise<boolean>;
    existsByNationalId(nationalId: string): Promise<boolean>;
    countByRole(role: UserRole): Promise<number>;
    countByVerificationStatus(status: string): Promise<number>;
    search(query: string, options?: {
        role?: UserRole;
        page?: number;
        limit?: number;
    }): Promise<{
        users: User[];
        total: number;
    }>;
}
