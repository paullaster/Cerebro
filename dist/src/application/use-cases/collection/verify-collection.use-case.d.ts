import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import { Collection } from '../../../domain/entities/collection.entity.ts';
import { IRealTimeService } from '../../../domain/adapters/real-time.service.ts';
import { IInvoiceService } from '../../services/invoice.service.ts';
export interface VerifyCollectionInput {
    collectionId: string;
    verifiedBy: string;
    notes?: string;
}
export declare class VerifyCollectionUseCase extends BaseUseCase<VerifyCollectionInput, Collection> {
    private readonly collectionRepository;
    private readonly userRepository;
    private readonly realTimeService;
    private readonly invoiceService;
    constructor(logger: ILogger, collectionRepository: ICollectionRepository, userRepository: IUserRepository, realTimeService: IRealTimeService, invoiceService: IInvoiceService);
    validate(input: VerifyCollectionInput): Promise<void>;
    execute(input: VerifyCollectionInput): Promise<Collection>;
}
