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
import { ValidationException } from '../../../domain/exceptions/domain.exception.ts';
import bcrypt from 'bcrypt';
let VerifyOtpUseCase = class VerifyOtpUseCase extends BaseUseCase {
    logger;
    otpRepository;
    constructor(logger, otpRepository) {
        super(logger);
        this.logger = logger;
        this.otpRepository = otpRepository;
    }
    async validate(input) {
        if (!input.identifier || !input.code || !input.type) {
            throw new ValidationException('Identifier, code and type are required');
        }
    }
    async execute(input) {
        const otpEntity = await this.otpRepository.findLatest(input.identifier, input.type);
        if (!otpEntity) {
            throw new ValidationException('OTP not found or expired');
        }
        if (!otpEntity.isValid()) {
            await this.otpRepository.delete(input.identifier, input.type);
            throw new ValidationException('OTP expired');
        }
        const isValid = await bcrypt.compare(input.code, otpEntity.codeHash);
        if (!isValid) {
            throw new ValidationException('Invalid OTP');
        }
        await this.otpRepository.delete(input.identifier, input.type);
        return {
            valid: true,
            message: 'OTP verified successfully',
        };
    }
};
VerifyOtpUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('IOtpVerificationRepository')),
    __metadata("design:paramtypes", [Object, Object])
], VerifyOtpUseCase);
export { VerifyOtpUseCase };
//# sourceMappingURL=verify-otp.use-case.js.map