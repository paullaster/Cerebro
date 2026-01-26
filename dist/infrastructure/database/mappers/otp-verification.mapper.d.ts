import { OtpVerification } from '../../../domain/entities/otp-verification.entity.ts';
export declare class OtpVerificationMapper {
    static toDomain(raw: any): OtpVerification;
    static toPersistence(entity: OtpVerification): any;
}
