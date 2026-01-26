import { Entity, DomainEvent } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Email } from '../value-objects/email.value-object.ts';
import { PhoneNumber } from '../value-objects/phone-number.value-object.ts';
import bcrypt from 'bcrypt';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  AGENT_COLLECTION = 'AGENT_COLLECTION',
  AGENT_STORE = 'AGENT_STORE',
  FARMER = 'FARMER',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UUIDv7,
    public readonly email: Email,
  ) {
    super();
  }

  getEventName(): string {
    return 'UserCreated';
  }
}

export class User extends Entity<UUIDv7> {
  private email: Email;
  private phoneNumber: PhoneNumber;
  private nationalId: string | null;
  private passwordHash: string;
  private role: UserRole;
  private isEmailVerified: boolean;
  private isPhoneVerified: boolean;
  private verificationStatus: VerificationStatus;
  private profilePhotoUrl: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: UUIDv7,
    email: Email,
    phoneNumber: PhoneNumber,
    passwordHash: string,
    role: UserRole,
  ) {
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

  static create(props: {
    email: Email;
    phoneNumber: PhoneNumber;
    passwordHash: string;
    role: UserRole;
  }): User {
    return new User(
      UUIDv7.generate(),
      props.email,
      props.phoneNumber,
      props.passwordHash,
      props.role,
    );
  }

  // Getters only - no setters for immutability
  getEmail(): Email {
    return this.email;
  }
  getPhoneNumber(): PhoneNumber {
    return this.phoneNumber;
  }
  getNationalId(): string | null {
    return this.nationalId;
  }
  getPasswordHash(): string {
    return this.passwordHash;
  }
  getRole(): UserRole {
    return this.role;
  }
  getIsEmailVerified(): boolean {
    return this.isEmailVerified;
  }
  getIsPhoneVerified(): boolean {
    return this.isPhoneVerified;
  }
  getVerificationStatus(): VerificationStatus {
    return this.verificationStatus;
  }
  getProfilePhotoUrl(): string | null {
    return this.profilePhotoUrl;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateEmail(email: Email): void {
    if (this.isEmailVerified) {
      throw new Error('Cannot change verified email');
    }
    this.email = email;
    this.isEmailVerified = false;
    this.markAsUpdated();
  }

  updatePhoneNumber(phoneNumber: PhoneNumber): void {
    if (this.isPhoneVerified) {
      throw new Error('Cannot change verified phone number');
    }
    this.phoneNumber = phoneNumber;
    this.isPhoneVerified = false;
    this.markAsUpdated();
  }

  setNationalId(nationalId: string): void {
    if (!/^\d{6,20}$/.test(nationalId)) {
      throw new Error('Invalid national ID format');
    }
    this.nationalId = nationalId;
    this.markAsUpdated();
  }

  verifyEmail(): void {
    this.isEmailVerified = true;
    this.markAsUpdated();
  }

  verifyPhone(): void {
    this.isPhoneVerified = true;
    this.markAsUpdated();
  }

  updateVerificationStatus(status: VerificationStatus): void {
    this.verificationStatus = status;
    this.markAsUpdated();
  }

  updateProfilePhoto(url: string): void {
    if (!url.startsWith('https://')) {
      throw new Error('Profile photo URL must be HTTPS');
    }
    this.profilePhotoUrl = url;
    this.markAsUpdated();
  }

  changePassword(newHash: string): void {
    this.passwordHash = newHash;
    this.markAsUpdated();
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  promoteToRole(newRole: UserRole): void {
    if (this.role === UserRole.SUPER_ADMIN) {
      throw new Error('Cannot change super admin role');
    }
    this.role = newRole;
    this.markAsUpdated();
  }

  private markAsUpdated(): void {
    this.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  canVerifyCollections(): boolean {
    return this.role === UserRole.AGENT_COLLECTION || this.isAdmin();
  }

  // Reconstitution
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
  }): User {
    const user = new User(
      props.id,
      props.email,
      props.phoneNumber,
      props.passwordHash,
      props.role,
    );
    user.nationalId = props.nationalId;
    user.isEmailVerified = props.isEmailVerified;
    user.isPhoneVerified = props.isPhoneVerified;
    user.verificationStatus = props.verificationStatus;
    user.profilePhotoUrl = props.profilePhotoUrl;
    user.createdAt = props.createdAt;
    user.updatedAt = props.updatedAt;

    user.clearDomainEvents(); // Clear creation event
    return user;
  }
}
