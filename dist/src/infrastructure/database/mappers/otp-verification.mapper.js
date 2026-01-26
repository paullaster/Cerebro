import { OtpVerification, } from '../../../domain/entities/otp-verification.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
export class OtpVerificationMapper {
    static toDomain(raw) {
        if (!raw)
            return null;
        return new OtpVerification(new UUIDv7(raw.id), raw.identifier, raw.code_hash, raw.type, new Date(raw.expires_at));
    }
    static toPersistence(entity) {
        return {
            id: entity.getId().toString(),
            identifier: entity.identifier,
            code_hash: entity.codeHash,
            type: entity.type,
            expires_at: entity.expiresAt,
        };
    }
}
//# sourceMappingURL=otp-verification.mapper.js.map