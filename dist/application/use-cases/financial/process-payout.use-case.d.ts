import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IPayoutRepository } from '../../../domain/repositories/payout.repository.ts';
import { ILoanRepository } from '../../../domain/repositories/loan.repository.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import { IPaymentGateway } from '../../../domain/adapters/payment.gateway.ts';
import { IRealTimeService } from '../../../domain/adapters/real-time.service.ts';
import { PayoutTransaction } from '../../../domain/entities/payout-transaction.entity.ts';
export interface ProcessPayoutInput {
    collectionId: string;
    processedBy: string;
}
export declare class ProcessPayoutUseCase extends BaseUseCase<ProcessPayoutInput, PayoutTransaction> {
    private readonly payoutRepository;
    private readonly loanRepository;
    private readonly collectionRepository;
    private readonly paymentGateway;
    private readonly realTimeService;
    constructor(logger: ILogger, payoutRepository: IPayoutRepository, loanRepository: ILoanRepository, collectionRepository: ICollectionRepository, paymentGateway: IPaymentGateway, realTimeService: IRealTimeService);
    validate(input: ProcessPayoutInput): Promise<void>;
    execute(input: ProcessPayoutInput): Promise<PayoutTransaction>;
    private calculatePayout;
    private getFarmerPhoneNumber;
    private applyLoanRecovery;
}
