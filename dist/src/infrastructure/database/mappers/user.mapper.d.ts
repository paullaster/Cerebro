import { User } from '../../../domain/entities/user.entity.ts';
export declare class UserMapper {
    static toDomain(raw: any): User;
    static toPersistence(user: User): any;
}
