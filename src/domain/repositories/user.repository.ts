import { User, UserRole } from '../entities/user.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Email } from '../value-objects/email.value-object.ts';
import { PhoneNumber } from '../value-objects/phone-number.value-object.ts';

export interface IUserRepository {
  // Find operations
  findById(id: UUIDv7): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phoneNumber: PhoneNumber): Promise<User | null>;
  findByNationalId(nationalId: string): Promise<User | null>;

  // List operations
  listByRole(
    role: UserRole,
    options?: {
      page?: number;
      limit?: number;
      verified?: boolean;
    },
  ): Promise<{ users: User[]; total: number }>;

  listAgentsByRegion(
    region: string,
    options?: {
      page?: number;
      limit?: number;
      verifiedOnly?: boolean;
    },
  ): Promise<{ users: User[]; total: number }>;

  // Existence checks
  existsByEmail(email: Email): Promise<boolean>;
  existsByPhone(phoneNumber: PhoneNumber): Promise<boolean>;
  existsByNationalId(nationalId: string): Promise<boolean>;

  // Save operations
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;

  // Delete operations
  delete(id: UUIDv7): Promise<void>;

  // Count operations
  countByRole(role: UserRole): Promise<number>;
  countByVerificationStatus(status: string): Promise<number>;

  // Search operations
  search(
    query: string,
    options?: {
      role?: UserRole;
      page?: number;
      limit?: number;
    },
  ): Promise<{ users: User[]; total: number }>;
}
