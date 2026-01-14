import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case';
import { ILogger } from '../../../domain/adapters/logger.service';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IProduceTypeRepository } from '../../../domain/repositories/produce-type.repository';
import { IMarketRateRepository } from '../../../domain/repositories/market-rate.repository';
import { Collection, CollectionGrade } from '../../../domain/entities/collection.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object';
import { Money } from '../../../domain/value-objects/money.value-object';
import { User } from '../../../domain/entities/user.entity';
import { ProduceType } from '../../../domain/entities/produce-type.entity';
import { MarketRate } from '../../../domain/entities/market-rate.entity';
import {
    EntityNotFoundException,
    BusinessRuleException,
    ValidationException,
} from '../../../domain/exceptions/domain.exception';

export interface CreateCollectionInput {
    storeAgentId: string;
    farmerId: string;
    produceTypeId: string;
    weightKg: number;
    qualityGrade: CollectionGrade;
    collectedAt: Date;
}

@Injectable()
export class CreateCollectionUseCase extends BaseUseCase<CreateCollectionInput, Collection> {
    constructor(
        @Inject('ILogger') logger: ILogger,
        @Inject('ICollectionRepository') private readonly collectionRepository: ICollectionRepository,
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
        @Inject('IProduceTypeRepository') private readonly produceTypeRepository: IProduceTypeRepository,
        @Inject('IMarketRateRepository') private readonly marketRateRepository: IMarketRateRepository,
    ) {
        super(logger);
    }

    async validate(input: CreateCollectionInput): Promise<void> {
        const errors: string[] = [];

        if (!input.storeAgentId || !UUIDv7.isValid(input.storeAgentId)) {
            errors.push('Invalid store agent ID');
        }

        if (!input.farmerId || !UUIDv7.isValid(input.farmerId)) {
            errors.push('Invalid farmer ID');
        }

        if (!input.produceTypeId || !UUIDv7.isValid(input.produceTypeId)) {
            errors.push('Invalid produce type ID');
        }

        if (!input.weightKg || input.weightKg <= 0) {
            errors.push('Weight must be positive');
        }

        if (input.weightKg > 10000) { // 10 metric tons max per collection
            errors.push('Weight exceeds maximum allowed');
        }

        if (!Object.values(CollectionGrade).includes(input.qualityGrade)) {
            errors.push('Invalid quality grade');
        }

        if (!input.collectedAt || input.collectedAt > new Date()) {
            errors.push('Collection date cannot be in the future');
        }

        if (errors.length > 0) {
            throw new ValidationException(errors.join(', '));
        }
    }

    async execute(input: CreateCollectionInput): Promise<Collection> {
        const [agent, farmer, produceType] = await Promise.all([
            this.userRepository.findById(new UUIDv7(input.storeAgentId)),
            this.userRepository.findById(new UUIDv7(input.farmerId)),
            this.produceTypeRepository.findById(new UUIDv7(input.produceTypeId)),
        ]);

        if (!agent || agent.getRole() !== 'AGENT') {
            throw new EntityNotFoundException('Agent', input.storeAgentId);
        }

        if (!farmer || farmer.getRole() !== 'FARMER') {
            throw new EntityNotFoundException('Farmer', input.farmerId);
        }

        if (!produceType) {
            throw new EntityNotFoundException('ProduceType', input.produceTypeId);
        }

        // Check if agent is verified
        if (!agent.isVerified()) {
            throw new BusinessRuleException('Agent must be verified to create collections', 'AGENT_NOT_VERIFIED');
        }

        // Check if farmer is verified
        if (!farmer.isVerified()) {
            throw new BusinessRuleException('Farmer must be verified to receive collections', 'FARMER_NOT_VERIFIED');
        }

        // Get current market rate
        const marketRate = await this.marketRateRepository.findCurrentRate(produceType.getId());
        if (!marketRate) {
            throw new BusinessRuleException('No market rate available for this produce', 'NO_MARKET_RATE');
        }

        // Calculate price using grade multiplier
        const gradeMultiplier = marketRate.getGradeMultiplier(input.qualityGrade);
        const baseRate = marketRate.getBaseRatePerKg();
        const appliedRate = baseRate.multiply(gradeMultiplier);
        const calculatedPayoutAmount = appliedRate.multiply(input.weightKg);

        // Create collection entity
        const collection = Collection.create({
            storeAgentId: new UUIDv7(input.storeAgentId),
            farmerId: new UUIDv7(input.farmerId),
            produceTypeId: new UUIDv7(input.produceTypeId),
            weightKg: input.weightKg,
            qualityGrade: input.qualityGrade,
            appliedRate,
            calculatedPayoutAmount,
            collectedAt: input.collectedAt,
        });

        // Save to repository
        const savedCollection = await this.collectionRepository.save(collection);

        this.logger.info(
            'CreateCollectionUseCase',
            'Collection created successfully',
            {
                collectionId: savedCollection.getId().toString(),
                farmerId: farmer.getId().toString(),
                agentId: agent.getId().toString(),
                amount: calculatedPayoutAmount.getAmount(),
                weight: input.weightKg,
            }
        );

        return savedCollection;
    }
}