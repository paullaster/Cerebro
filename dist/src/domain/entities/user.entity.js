import { Entity, DomainEvent } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import bcrypt from 'bcrypt';
export var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["AGENT_COLLECTION"] = "AGENT_COLLECTION";
    UserRole["AGENT_STORE"] = "AGENT_STORE";
    UserRole["FARMER"] = "FARMER";
})(UserRole || (UserRole = {}));
export var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["SUSPENDED"] = "SUSPENDED";
})(VerificationStatus || (VerificationStatus = {}));
export class UserCreatedEvent extends DomainEvent {
    userId;
    email;
    constructor(userId, email) {
        super();
        this.userId = userId;
        this.email = email;
    }
    getEventName() {
        return 'UserCreated';
    }
}
export class User extends Entity {
    email;
    phoneNumber;
    nationalId;
    passwordHash;
    role;
    isEmailVerified;
    isPhoneVerified;
    verificationStatus;
    profilePhotoUrl;
    createdAt;
    updatedAt;
    constructor(id, email, phoneNumber, passwordHash, role) {
        super(id);
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.nationalId = null;
        this.passwordHash = passwordHash;
        this.role = role;
        this.isEmailVerified = false;
        this.isPhoneVerified = false;
        this.verificationStatus = VerificationStatus.PENDING;
        this.profilePhotoUrl = null;
        const now = new Date();
        this.createdAt = now;
        this.updatedAt = now;
        this.addDomainEvent(new UserCreatedEvent(id, email));
    }
    static create(props) {
        return new User(UUIDv7.generate(), props.email, props.phoneNumber, props.passwordHash, props.role);
    }
    getEmail() {
        return this.email;
    }
    getPhoneNumber() {
        return this.phoneNumber;
    }
    getNationalId() {
        return this.nationalId;
    }
    getPasswordHash() {
        return this.passwordHash;
    }
    getRole() {
        return this.role;
    }
    getIsEmailVerified() {
        return this.isEmailVerified;
    }
    getIsPhoneVerified() {
        return this.isPhoneVerified;
    }
    getVerificationStatus() {
        return this.verificationStatus;
    }
    getProfilePhotoUrl() {
        return this.profilePhotoUrl;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    updateEmail(email) {
        if (this.isEmailVerified) {
            throw new Error('Cannot change verified email');
        }
        this.email = email;
        this.isEmailVerified = false;
        this.markAsUpdated();
    }
    updatePhoneNumber(phoneNumber) {
        if (this.isPhoneVerified) {
            throw new Error('Cannot change verified phone number');
        }
        this.phoneNumber = phoneNumber;
        this.isPhoneVerified = false;
        this.markAsUpdated();
    }
    setNationalId(nationalId) {
        if (!/^\d{6,20}$/.test(nationalId)) {
            throw new Error('Invalid national ID format');
        }
        this.nationalId = nationalId;
        this.markAsUpdated();
    }
    verifyEmail() {
        this.isEmailVerified = true;
        this.markAsUpdated();
    }
    verifyPhone() {
        this.isPhoneVerified = true;
        this.markAsUpdated();
    }
    updateVerificationStatus(status) {
        this.verificationStatus = status;
        this.markAsUpdated();
    }
    updateProfilePhoto(url) {
        if (!url.startsWith('https://')) {
            throw new Error('Profile photo URL must be HTTPS');
        }
        this.profilePhotoUrl = url;
        this.markAsUpdated();
    }
    changePassword(newHash) {
        this.passwordHash = newHash;
        this.markAsUpdated();
    }
    async validatePassword(password) {
        return bcrypt.compare(password, this.passwordHash);
    }
    promoteToRole(newRole) {
        if (this.role === UserRole.SUPER_ADMIN) {
            throw new Error('Cannot change super admin role');
        }
        this.role = newRole;
        this.markAsUpdated();
    }
    markAsUpdated() {
        this.updatedAt = new Date();
    }
    isAdmin() {
        return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
    }
    canVerifyCollections() {
        return this.role === UserRole.AGENT_COLLECTION || this.isAdmin();
    }
    static reconstitute(props) {
        const user = new User(props.id, props.email, props.phoneNumber, props.passwordHash, props.role);
        user.nationalId = props.nationalId;
        user.isEmailVerified = props.isEmailVerified;
        user.isPhoneVerified = props.isPhoneVerified;
        user.verificationStatus = props.verificationStatus;
        user.profilePhotoUrl = props.profilePhotoUrl;
        user.createdAt = props.createdAt;
        user.updatedAt = props.updatedAt;
        user.clearDomainEvents();
        return user;
    }
}
//# sourceMappingURL=user.entity.js.map