import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IOtpVerificationRepository } from '../../../domain/repositories/otp-verification.repository.ts';
import { OtpType } from '../../../domain/entities/otp-verification.entity.ts';
export interface VerifyOtpInput {
    identifier: string;
    code: string;
    type: OtpType;
}
export interface VerifyOtpOutput {
    valid: boolean;
    message: string;
}
export declare class VerifyOtpUseCase extends BaseUseCase<VerifyOtpInput, VerifyOtpOutput> {
    protected readonly logger: ILogger;
    private readonly otpRepository;
    constructor(logger: ILogger, otpRepository: IOtpVerificationRepository);
    validate(input: VerifyOtpInput): Promise<void>;
    execute(input: VerifyOtpInput): Promise<VerifyOtpOutput>;
}
