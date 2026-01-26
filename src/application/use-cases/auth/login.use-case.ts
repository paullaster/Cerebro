import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import { IJwtService } from '../../../domain/adapters/jwt.service.ts';
import { Email } from '../../../domain/value-objects/email.value-object.ts';
import { ValidationException } from '../../../domain/exceptions/domain.exception.ts';
import bcrypt from 'bcrypt';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoginUseCase extends BaseUseCase<LoginInput, LoginOutput> {
  constructor(
    @Inject('ILogger') protected override readonly logger: ILogger,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IJwtService') private readonly jwtService: IJwtService,
  ) {
    super(logger);
  }

  async validate(input: LoginInput): Promise<void> {
    if (!input.email || !input.password) {
      throw new ValidationException('Email and password are required');
    }
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Mitigate timing attacks
      await this.dummyCompare();
      throw new ValidationException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(input.password);
    if (!isPasswordValid) {
      throw new ValidationException('Invalid credentials');
    }

    // Generate Tokens
    const payload = {
      sub: user.getId().toString(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    this.logger.info('Auth', `User logged in: ${user.getId().toString()}`, {
      userId: user.getId().toString(),
      role: user.getRole(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.getId().toString(),
        email: user.getEmail().getValue(),
        role: user.getRole(),
      },
    };
  }

  private async dummyCompare(): Promise<void> {
    // Use a fixed salt and dummy hash to simulate bcrypt workload
    const dummyHash =
      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgNIvB.3VpE9bO9iS0PzV0P1Y0P1';
    await bcrypt.compare('dummy_password', dummyHash);
  }
}
