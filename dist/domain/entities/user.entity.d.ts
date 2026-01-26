import { Entity, DomainEvent } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Email } from '../value-objects/email.value-object.ts';
import { PhoneNumber } from '../value-objects/phone-number.value-object.ts';
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    AGENT_COLLECTION = "AGENT_COLLECTION",
    AGENT_STORE = "AGENT_STORE",
    FARMER = "FARMER"
}
export declare enum VerificationStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}
export declare class UserCreatedEvent extends DomainEvent {
    readonly userId: UUIDv7;
    readonly email: Email;
    constructor(userId: UUIDv7, email: Email);
    getEventName(): string;
}
export declare class User extends Entity<UUIDv7> {
    private email;
    private phoneNumber;
    private nationalId;
    private passwordHash;
    private role;
    private isEmailVerified;
    private isPhoneVerified;
    private verificationStatus;
    private profilePhotoUrl;
    private createdAt;
    private updatedAt;
    private constructor();
    static create(props: {
        email: Email;
        phoneNumber: PhoneNumber;
        passwordHash: string;
        role: UserRole;
    }): User;
    getEmail(): Email;
    getPhoneNumber(): PhoneNumber;
    getNationalId(): string | null;
    getPasswordHash(): string;
    getRole(): UserRole;
    getIsEmailVerified(): boolean;
    getIsPhoneVerified(): boolean;
    getVerificationStatus(): VerificationStatus;
    getProfilePhotoUrl(): string | null;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    updateEmail(email: Email): void;
    updatePhoneNumber(phoneNumber: PhoneNumber): void;
    setNationalId(nationalId: string): void;
    verifyEmail(): void;
    verifyPhone(): void;
    updateVerificationStatus(status: VerificationStatus): void;
    updateProfilePhoto(url: string): void;
    changePassword(newHash: string): void;
    validatePassword(password: string): Promise<boolean>;
    promoteToRole(newRole: UserRole): void;
    private markAsUpdated;
    isAdmin(): boolean;
    canVerifyCollections(): boolean;
    static reconstitute(props: {
        id: UUIDv7;
        email: Email;
        phoneNumber: PhoneNumber;
        nationalId: string | null;
        passwordHash: string;
        role: UserRole;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        verificationStatus: VerificationStatus;
        profilePhotoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): User;
}
