var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { Email } from '../../../domain/value-objects/email.value-object.ts';
import { ValidationException } from '../../../domain/exceptions/domain.exception.ts';
import bcrypt from 'bcrypt';
let LoginUseCase = class LoginUseCase extends BaseUseCase {
    logger;
    userRepository;
    jwtService;
    constructor(logger, userRepository, jwtService) {
        super(logger);
        this.logger = logger;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async validate(input) {
        if (!input.email || !input.password) {
            throw new ValidationException('Email and password are required');
        }
    }
    async execute(input) {
        const email = new Email(input.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            await this.dummyCompare();
            throw new ValidationException('Invalid credentials');
        }
        const isPasswordValid = await user.validatePassword(input.password);
        if (!isPasswordValid) {
            throw new ValidationException('Invalid credentials');
        }
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
    async dummyCompare() {
        const dummyHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgNIvB.3VpE9bO9iS0PzV0P1Y0P1';
        await bcrypt.compare('dummy_password', dummyHash);
    }
};
LoginUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('IUserRepository')),
    __param(2, Inject('IJwtService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], LoginUseCase);
export { LoginUseCase };
//# sourceMappingURL=login.use-case.js.map