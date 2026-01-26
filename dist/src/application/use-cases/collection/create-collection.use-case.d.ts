import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import { CollectionGrade } from '../../../domain/entities/collection.entity.ts';
import { IRealTimeService } from '../../../domain/adapters/real-time.service.ts';
export interface CreateCollectionInput {
    storeAgentId: string;
    farmerId: string;
    produceTypeId: string;
    weightKg: number;
    qualityGrade: CollectionGrade;
}
export interface CreateCollectionOutput {
    collectionId: string;
    invoiceId: string;
    payoutAmount: number;
}
export declare class CreateCollectionUseCase extends BaseUseCase<CreateCollectionInput, CreateCollectionOutput> {
    protected readonly logger: ILogger;
    private readonly collectionRepository;
    private readonly realTimeService;
    constructor(logger: ILogger, collectionRepository: ICollectionRepository, realTimeService: IRealTimeService);
    validate(input: CreateCollectionInput): Promise<void>;
    execute(input: CreateCollectionInput): Promise<CreateCollectionOutput>;
}
