import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import { IFarmerRepository } from '../../../domain/repositories/farmer.repository.ts';
import { User, UserRole } from '../../../domain/entities/user.entity.ts';
import { Farmer, PaymentMethod } from '../../../domain/entities/farmer.entity.ts';
import { Email } from '../../../domain/value-objects/email.value-object.ts';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.value-object.ts';
import { ConflictException } from '../../../domain/exceptions/domain.exception.ts';
import bcrypt from 'bcrypt';

export interface RegisterFarmerInput {
    email: string;
    phoneNumber: string;
    password: string;
    nationalId: string;
    farmName: string;
    locationPlaceId: string;
    locationLat: number;
    locationLng: number;
    cropSpecialties: string[];
    preferredPaymentMethod: string;
}

export interface RegisterFarmerOutput {
    userId: string;
    email: string;
    message: string;
}

@Injectable()
export class RegisterFarmerUseCase extends BaseUseCase<RegisterFarmerInput, RegisterFarmerOutput> {
    constructor(
        @Inject('ILogger') protected override readonly logger: ILogger,
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
        @Inject('IFarmerRepository') private readonly farmerRepository: IFarmerRepository,
    ) {
        super(logger);
    }

    async validate(input: RegisterFarmerInput): Promise<void> {
        const email = new Email(input.email);
        const phone = new PhoneNumber(input.phoneNumber);

        const [emailExists, phoneExists, nationalIdExists] = await Promise.all([
            this.userRepository.existsByEmail(email),
            this.userRepository.existsByPhone(phone),
            this.userRepository.existsByNationalId(input.nationalId),
        ]);

        if (emailExists) throw new ConflictException('Email already exists');
        if (phoneExists) throw new ConflictException('Phone number already exists');
        if (nationalIdExists) throw new ConflictException('National ID already exists');
    }

    async execute(input: RegisterFarmerInput): Promise<RegisterFarmerOutput> {
        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create User
        const user = User.create({
            email: new Email(input.email),
            phoneNumber: new PhoneNumber(input.phoneNumber),
            passwordHash: passwordHash,
            role: UserRole.FARMER,
        });
        user.setNationalId(input.nationalId);

        // Save User
        const savedUser = await this.userRepository.save(user);

        // Create Farmer
        const farmer = Farmer.create({
            userId: savedUser.getId(),
            farmName: input.farmName,
            locationPlaceId: input.locationPlaceId,
            locationLat: input.locationLat,
            locationLng: input.locationLng,
            cropSpecialties: input.cropSpecialties,
            preferredPaymentMethod: input.preferredPaymentMethod as PaymentMethod,
        });

        // Save Farmer
        await this.farmerRepository.save(farmer);

        // TODO: Generate and send OTPs (Async)
        // this.eventBus.publish(new UserRegisteredEvent(savedUser.getId()));

        return {
            userId: savedUser.getId().toString(),
            email: savedUser.getEmail().getValue(),
            message: 'Farmer registered successfully. Please verify your email and phone.',
        };
    }
}