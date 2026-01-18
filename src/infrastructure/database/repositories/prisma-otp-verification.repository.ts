import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IOtpVerificationRepository } from '../../../domain/repositories/otp-verification.repository.ts';
import { OtpVerification, OtpType } from '../../../domain/entities/otp-verification.entity.ts';
import { OtpVerificationMapper } from '../mappers/otp-verification.mapper.ts';

@Injectable()
export class PrismaOtpVerificationRepository implements IOtpVerificationRepository, OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit(): Promise<void> {
        await this.prisma.$connect();
    }

    async save(otp: OtpVerification): Promise<OtpVerification> {
        const data = OtpVerificationMapper.toPersistence(otp);
        const result = await this.prisma.otpVerification.create({
            data,
        });
        return OtpVerificationMapper.toDomain(result);
    }

    async findLatest(identifier: string, type: OtpType): Promise<OtpVerification | null> {
        const result = await this.prisma.otpVerification.findFirst({
            where: { identifier, type: type as any },
            orderBy: { expires_at: 'desc' },
        });
        return OtpVerificationMapper.toDomain(result);
    }

    async delete(identifier: string, type: OtpType): Promise<void> {
        await this.prisma.otpVerification.deleteMany({
            where: { identifier, type: type as any },
        });
    }
}