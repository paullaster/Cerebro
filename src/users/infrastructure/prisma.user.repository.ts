import { UpdateUserDto } from '../dto/update-user.dto.js';
import {
  IUserRepository,
  PaginatedResult,
} from '../entities/user.repository.interfaces.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity.js';
import { users as DBUser, Prisma } from 'generated/prisma/client.js';
import { QueryUserDto } from '../dto/query-user.dto.js';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(createDto: User): Promise<DBUser> {
    return await this.prisma.users.create({
      data: createDto as DBUser,
    });
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<DBUser>> {
    const {
      page = 1,
      limit = 10,
      role,
      verification_status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.usersWhereInput = {
      ...(role && { role }),
      ...(verification_status && { verification_status }),
      ...(search && {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.users.count({ where }),
      this.prisma.users.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async findOne(
    id: string,
    options: Record<string, never> = {},
  ): Promise<DBUser | null> {
    return await this.prisma.users.findUnique({
      where: {
        id,
      },
      ...options,
    });
  }
  async findByUsername(
    username: string,
    options: Record<string, never> = {},
  ): Promise<DBUser | null> {
    return await this.prisma.users.findUnique({
      where: {
        username,
      },
      ...options,
    });
  }
  async update(id: string, updateDto: UpdateUserDto): Promise<DBUser> {
    return await this.prisma.users.update({
      where: {
        id,
      },
      data: updateDto.toPersistenceObject(),
    });
  }
  async delete(id: string): Promise<void> {
    await this.prisma.users.delete({
      where: {
        id,
      },
    });
  }
}
