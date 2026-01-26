import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { ILoanRepository } from '../../../domain/repositories/loan.repository.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import { IConfigService } from '../../services/config.service.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
export interface CalculatePayoutInput {
    farmerId: string;
    collectionAmount: Money;
}
export interface CalculatePayoutOutput {
    grossAmount: Money;
    loanRecovery: Money;
    netAmount: Money;
    recoveryRate: number;
    livingWageProtected: boolean;
}
export declare class CalculatePayoutUseCase extends BaseUseCase<CalculatePayoutInput, CalculatePayoutOutput> {
    private readonly loanRepository;
    private readonly collectionRepository;
    private readonly configService;
    private readonly loanRecoveryCap;
    constructor(logger: ILogger, loanRepository: ILoanRepository, collectionRepository: ICollectionRepository, configService: IConfigService);
    validate(input: CalculatePayoutInput): Promise<void>;
    execute(input: CalculatePayoutInput): Promise<CalculatePayoutOutput>;
}
