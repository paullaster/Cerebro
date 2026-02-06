import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { InternalServerErrorException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUsername: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IUserRepository',
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return a User instance on success', async () => {
      const userData = {
        email: 'test@example.com',
        password_hash: 'hashed',
      } as User;
      repository.create.mockResolvedValue(userData);

      const result = await service.create(userData);

      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe(userData.email);
      // Note: password_hash is still present in the instance,
      // but will be stripped by ClassSerializerInterceptor in the controller.
      expect(result.password_hash).toBe(userData.password_hash);
    });

    it('should throw InternalServerErrorException when repository fails with non-Error', async () => {
      repository.create.mockRejectedValue('Some weird error');

      await expect(service.create({} as User)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should rethrow error if it is an instance of Error', async () => {
      const error = new Error('Database error');
      repository.create.mockRejectedValue(error);

      await expect(service.create({} as User)).rejects.toThrow(error);
    });
  });
});
