import { User, UserRole, VerificationStatus } from '../../../domain/entities/user.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Email } from '../../../domain/value-objects/email.value-object.ts';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.value-object.ts';

export class UserMapper {
    static toDomain(raw: any): User {
        if (!raw) return null;

        return User.reconstitute({
            id: new UUIDv7(raw.id),
            email: new Email(raw.email),
            phoneNumber: new PhoneNumber(raw.phone_number),
            nationalId: raw.national_id,
            passwordHash: raw.password_hash,
            role: raw.role as UserRole,
            isEmailVerified: raw.is_email_verified,
            isPhoneVerified: raw.is_phone_verified,
            verificationStatus: raw.verification_status as VerificationStatus,
            profilePhotoUrl: raw.profile_photo_url,
            createdAt: new Date(raw.created_at),
            updatedAt: new Date(raw.updated_at),
        });
    }

    static toPersistence(user: User): any {
        return {
            id: user.getId().toString(),
            email: user.getEmail().getValue(),
            phone_number: user.getPhoneNumber().getValue(),
            national_id: user.getNationalId(),
            password_hash: user.getPasswordHash(),
            role: user.getRole(),
            is_email_verified: user.getIsEmailVerified(),
            is_phone_verified: user.getIsPhoneVerified(),
            verification_status: user.getVerificationStatus(),
            profile_photo_url: user.getProfilePhotoUrl(),
            created_at: user.getCreatedAt(),
            updated_at: user.getUpdatedAt(),
        };
    }
}