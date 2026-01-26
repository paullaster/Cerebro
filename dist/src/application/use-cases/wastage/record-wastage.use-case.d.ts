import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IWastageRecordRepository } from '../../../domain/repositories/wastage-record.repository.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import { WastageRecord, WastageReason } from '../../../domain/entities/wastage-record.entity.ts';
export interface RecordWastageInput {
    agentId: string;
    produceTypeId: string;
    weightKg: number;
    reason: WastageReason;
    collectionId?: string;
    notes?: string;
}
export declare class RecordWastageUseCase extends BaseUseCase<RecordWastageInput, WastageRecord> {
    protected readonly logger: ILogger;
    private readonly wastageRepository;
    private readonly collectionRepository;
    constructor(logger: ILogger, wastageRepository: IWastageRecordRepository, collectionRepository: ICollectionRepository);
    validate(input: RecordWastageInput): Promise<void>;
    execute(input: RecordWastageInput): Promise<WastageRecord>;
}
