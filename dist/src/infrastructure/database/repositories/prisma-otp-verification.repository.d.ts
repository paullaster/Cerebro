import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { IOtpVerificationRepository } from '../../../domain/repositories/otp-verification.repository.ts';
import { OtpVerification, OtpType } from '../../../domain/entities/otp-verification.entity.ts';
export declare class PrismaOtpVerificationRepository implements IOtpVerificationRepository, OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    save(otp: OtpVerification): Promise<OtpVerification>;
    findLatest(identifier: string, type: OtpType): Promise<OtpVerification | null>;
    delete(identifier: string, type: OtpType): Promise<void>;
}
