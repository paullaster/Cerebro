import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IFarmerRepository } from '../../../domain/repositories/farmer.repository.ts';
import { Farmer } from '../../../domain/entities/farmer.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { FarmerMapper } from '../mappers/farmer.mapper.ts';

@Injectable()
export class PrismaFarmerRepository implements IFarmerRepository, OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect();
    }

    async save(farmer: Farmer): Promise<Farmer> {
        const data = FarmerMapper.toPersistence(farmer);

        const result = await this.prisma.farmer.upsert({
            where: { user_id: data.user_id },
            update: data,
            create: data,
        });

        return FarmerMapper.toDomain(result);
    }

    async findById(userId: UUIDv7): Promise<Farmer | null> {
        const result = await this.prisma.farmer.findUnique({
            where: { user_id: userId.toString() },
        });

        return FarmerMapper.toDomain(result);
    }
}