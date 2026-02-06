import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type {
  IUserRepository,
  PaginatedResult,
} from './entities/user.repository.interfaces.js';
import { User } from './entities/user.entity.js';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { QueryUserDto } from './dto/query-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}
  async create(createUserDto: User): Promise<User> {
    try {
      if (!createUserDto.password) {
        throw new InternalServerErrorException('Password is required');
      }
      const saltOrRounds = 10;

      const salt = await bcrypt.genSalt(saltOrRounds);
      const { password, ...userData } = createUserDto;

      const hashedPassword = await bcrypt.hash(password as string, salt);

      const persistableObject = {
        ...userData,
        password_hash: hashedPassword,
      } as User;

      const createdUser = await this.userRepository.create(persistableObject);
      return plainToInstance(User, createdUser);
    } catch (error) {
      // Logic for handling failure:
      // If it's a known error type, it might already be handled by PrismaClientFilter.
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<User>> {
    const result = await this.userRepository.findAll(query);
    return {
      ...result,
      data: plainToInstance(User, result.data),
    };
  }

  async findOne(id: string, options?: Record<string, never>): Promise<User> {
    const user = await this.userRepository.findOne(id, options);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return plainToInstance(User, user);
  }

  async findByUserName(
    username: string,
    options?: Record<string, never>,
  ): Promise<User> {
    const user = await this.userRepository.findByUsername(username, options);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return plainToInstance(User, user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userRepository.update(id, updateUserDto);
    return plainToInstance(User, updatedUser);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
