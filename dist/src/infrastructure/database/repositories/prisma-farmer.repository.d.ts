import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IFarmerRepository } from '../../../domain/repositories/farmer.repository.ts';
import { Farmer } from '../../../domain/entities/farmer.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
export declare class PrismaFarmerRepository implements IFarmerRepository, OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    save(farmer: Farmer): Promise<Farmer>;
    findById(userId: UUIDv7): Promise<Farmer | null>;
}
