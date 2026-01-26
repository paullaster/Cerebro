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
import { FarmerMapper } from '../mappers/farmer.mapper.ts';
let PrismaFarmerRepository = class PrismaFarmerRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.prisma.getReadOnlyClient();
    }
    async save(farmer) {
        const data = FarmerMapper.toPersistence(farmer);
        const result = await this.prisma.farmer.upsert({
            where: { user_id: data.user_id },
            update: data,
            create: data,
        });
        return FarmerMapper.toDomain(result);
    }
    async findById(userId) {
        const result = await this.prisma.farmer.findUnique({
            where: { user_id: userId.toString() },
        });
        return FarmerMapper.toDomain(result);
    }
};
PrismaFarmerRepository = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PrismaFarmerRepository);
export { PrismaFarmerRepository };
//# sourceMappingURL=prisma-farmer.repository.js.map