import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import { IFarmerRepository } from '../../../domain/repositories/farmer.repository.ts';
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
export declare class RegisterFarmerUseCase extends BaseUseCase<RegisterFarmerInput, RegisterFarmerOutput> {
    protected readonly logger: ILogger;
    private readonly userRepository;
    private readonly farmerRepository;
    constructor(logger: ILogger, userRepository: IUserRepository, farmerRepository: IFarmerRepository);
    validate(input: RegisterFarmerInput): Promise<void>;
    execute(input: RegisterFarmerInput): Promise<RegisterFarmerOutput>;
}
