import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IOtpVerificationRepository } from '../../../domain/repositories/otp-verification.repository.ts';
import { OtpType } from '../../../domain/entities/otp-verification.entity.ts';
import { ValidationException } from '../../../domain/exceptions/domain.exception.ts';
import bcrypt from 'bcrypt';

export interface VerifyOtpInput {
    identifier: string; // Email or Phone
    code: string;
    type: OtpType;
}

export interface VerifyOtpOutput {
    valid: boolean;
    message: string;
}

@Injectable()
export class VerifyOtpUseCase extends BaseUseCase<VerifyOtpInput, VerifyOtpOutput> {
    constructor(
        @Inject('ILogger') protected override readonly logger: ILogger,
        @Inject('IOtpVerificationRepository') private readonly otpRepository: IOtpVerificationRepository,
    ) {
        super(logger);
    }

    async validate(input: VerifyOtpInput): Promise<void> {
        if (!input.identifier || !input.code || !input.type) {
            throw new ValidationException('Identifier, code and type are required');
        }
    }

    async execute(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
        const otpEntity = await this.otpRepository.findLatest(input.identifier, input.type);

        if (!otpEntity) {
            throw new ValidationException('OTP not found or expired');
        }

        if (!otpEntity.isValid()) {
            await this.otpRepository.delete(input.identifier, input.type);
            throw new ValidationException('OTP expired');
        }

        // Verify Hash
        const isValid = await bcrypt.compare(input.code, otpEntity.codeHash);

        if (!isValid) {
            throw new ValidationException('Invalid OTP');
        }

        // If valid, delete it to prevent reuse
        await this.otpRepository.delete(input.identifier, input.type);

        return {
            valid: true,
            message: 'OTP verified successfully',
        };
    }
}