import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case';
import { ILogger } from '../../../domain/adapters/logger.service';
import { ILoanRepository } from '../../../domain/repositories/loan.repository';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository';
import { IConfigService } from '../../services/config.service';
import { Money } from '../../../domain/value-objects/money.value-object';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object';
import {
    EntityNotFoundException,
    BusinessRuleException,
} from '../../../domain/exceptions/domain.exception';

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

@Injectable()
export class CalculatePayoutUseCase extends BaseUseCase<CalculatePayoutInput, CalculatePayoutOutput> {
    private readonly loanRecoveryCap: number;

    constructor(
        @Inject('ILogger') logger: ILogger,
        @Inject('ILoanRepository') private readonly loanRepository: ILoanRepository,
        @Inject('ICollectionRepository') private readonly collectionRepository: ICollectionRepository,
        @Inject('IConfigService') private readonly configService: IConfigService,
    ) {
        super(logger);
        this.loanRecoveryCap = configService.getLoanRecoveryCap();
    }

    async validate(input: CalculatePayoutInput): Promise<void> {
        if (!input.farmerId || !UUIDv7.isValid(input.farmerId)) {
            throw new Error('Invalid farmer ID');
        }

        if (input.collectionAmount.isLessThan(Money.zero())) {
            throw new Error('Collection amount cannot be negative');
        }
    }

    async execute(input: CalculatePayoutInput): Promise<CalculatePayoutOutput> {
        const farmerId = new UUIDv7(input.farmerId);

        // Get outstanding loan balance
        const loanBalance = await this.loanRepository.getOutstandingBalance(farmerId);

        // Calculate maximum recoverable amount (Living Wage Guardrail)
        const maxRecoverable = input.collectionAmount.multiply(this.loanRecoveryCap);

        // Determine actual recovery amount
        let loanRecovery: Money;
        let livingWageProtected = false;

        if (loanBalance.isGreaterThan(Money.zero())) {
            if (loanBalance.isGreaterThan(maxRecoverable)) {
                loanRecovery = maxRecoverable;
                livingWageProtected = true;
                this.logger.info(
                    'CalculatePayoutUseCase',
                    'Living wage guardrail activated',
                    {
                        farmerId: farmerId.toString(),
                        loanBalance: loanBalance.getAmount(),
                        maxRecoverable: maxRecoverable.getAmount(),
                        collectionAmount: input.collectionAmount.getAmount(),
                    }
                );
            } else {
                loanRecovery = loanBalance;
            }
        } else {
            loanRecovery = Money.zero();
        }

        // Calculate net payout
        const netAmount = input.collectionAmount.subtract(loanRecovery);

        // Ensure net amount is not negative
        if (netAmount.isLessThan(Money.zero())) {
            throw new BusinessRuleException(
                'Net payout cannot be negative',
                'NEGATIVE_NET_PAYOUT'
            );
        }

        // Calculate recovery rate
        const recoveryRate = loanRecovery.isZero()
            ? 0
            : (loanRecovery.getAmount() / input.collectionAmount.getAmount()) * 100;

        this.logger.debug(
            'CalculatePayoutUseCase',
            'Payout calculation completed',
            {
                farmerId: farmerId.toString(),
                grossAmount: input.collectionAmount.getAmount(),
                loanRecovery: loanRecovery.getAmount(),
                netAmount: netAmount.getAmount(),
                recoveryRate,
                livingWageProtected,
            }
        );

        return {
            grossAmount: input.collectionAmount,
            loanRecovery,
            netAmount,
            recoveryRate,
            livingWageProtected,
        };
    }
}