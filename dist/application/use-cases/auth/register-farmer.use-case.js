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
import { User, UserRole } from '../../../domain/entities/user.entity.ts';
import { Farmer, } from '../../../domain/entities/farmer.entity.ts';
import { Email } from '../../../domain/value-objects/email.value-object.ts';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.value-object.ts';
import { ConflictException } from '../../../domain/exceptions/domain.exception.ts';
import bcrypt from 'bcrypt';
let RegisterFarmerUseCase = class RegisterFarmerUseCase extends BaseUseCase {
    logger;
    userRepository;
    farmerRepository;
    constructor(logger, userRepository, farmerRepository) {
        super(logger);
        this.logger = logger;
        this.userRepository = userRepository;
        this.farmerRepository = farmerRepository;
    }
    async validate(input) {
        const email = new Email(input.email);
        const phone = new PhoneNumber(input.phoneNumber);
        const [emailExists, phoneExists, nationalIdExists] = await Promise.all([
            this.userRepository.existsByEmail(email),
            this.userRepository.existsByPhone(phone),
            this.userRepository.existsByNationalId(input.nationalId),
        ]);
        if (emailExists)
            throw new ConflictException('Email already exists');
        if (phoneExists)
            throw new ConflictException('Phone number already exists');
        if (nationalIdExists)
            throw new ConflictException('National ID already exists');
    }
    async execute(input) {
        const passwordHash = await bcrypt.hash(input.password, 10);
        const user = User.create({
            email: new Email(input.email),
            phoneNumber: new PhoneNumber(input.phoneNumber),
            passwordHash: passwordHash,
            role: UserRole.FARMER,
        });
        user.setNationalId(input.nationalId);
        const savedUser = await this.userRepository.save(user);
        const farmer = Farmer.create({
            userId: savedUser.getId(),
            farmName: input.farmName,
            locationPlaceId: input.locationPlaceId,
            locationLat: input.locationLat,
            locationLng: input.locationLng,
            cropSpecialties: input.cropSpecialties,
            preferredPaymentMethod: input.preferredPaymentMethod,
        });
        await this.farmerRepository.save(farmer);
        return {
            userId: savedUser.getId().toString(),
            email: savedUser.getEmail().getValue(),
            message: 'Farmer registered successfully. Please verify your email and phone.',
        };
    }
};
RegisterFarmerUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('IUserRepository')),
    __param(2, Inject('IFarmerRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], RegisterFarmerUseCase);
export { RegisterFarmerUseCase };
//# sourceMappingURL=register-farmer.use-case.js.map