import { OtpVerification, OtpType } from '../entities/otp-verification.entity.ts';
export interface IOtpVerificationRepository {
    save(otp: OtpVerification): Promise<OtpVerification>;
    findLatest(identifier: string, type: OtpType): Promise<OtpVerification | null>;
    delete(identifier: string, type: OtpType): Promise<void>;
}
