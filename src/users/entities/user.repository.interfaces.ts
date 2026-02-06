import { users } from 'generated/prisma/client.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { User } from './user.entity.js';
import { QueryUserDto } from '../dto/query-user.dto.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IUserRepository {
  create(createDto: User): Promise<users>;
  findAll(query: QueryUserDto): Promise<PaginatedResult<users>>;
  findOne(id: string, options?: Record<string, never>): Promise<users | null>;
  findByUsername(
    username: string,
    options?: Record<string, never>,
  ): Promise<users | null>;
  update(id: string, updateDto: UpdateUserDto): Promise<users>;
  delete(id: string): Promise<void>;
}
