import { User, UserRole } from '../entities/user.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Email } from '../value-objects/email.value-object.ts';
import { PhoneNumber } from '../value-objects/phone-number.value-object.ts';
export interface IUserRepository {
    findById(id: UUIDv7): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    findByPhone(phoneNumber: PhoneNumber): Promise<User | null>;
    findByNationalId(nationalId: string): Promise<User | null>;
    listByRole(role: UserRole, options?: {
        page?: number;
        limit?: number;
        verified?: boolean;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    listAgentsByRegion(region: string, options?: {
        page?: number;
        limit?: number;
        verifiedOnly?: boolean;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    existsByEmail(email: Email): Promise<boolean>;
    existsByPhone(phoneNumber: PhoneNumber): Promise<boolean>;
    existsByNationalId(nationalId: string): Promise<boolean>;
    save(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(id: UUIDv7): Promise<void>;
    countByRole(role: UserRole): Promise<number>;
    countByVerificationStatus(status: string): Promise<number>;
    search(query: string, options?: {
        role?: UserRole;
        page?: number;
        limit?: number;
    }): Promise<{
        users: User[];
        total: number;
    }>;
}
