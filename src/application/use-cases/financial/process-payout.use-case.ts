import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case';
import { ILogger } from '../../../domain/adapters/logger.service';
import { IPayoutRepository } from '../../../domain/repositories/payout.repository';
import { ILoanRepository } from '../../../domain/repositories/loan.repository';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository';
import { IPaymentGateway } from '../../../domain/adapters/payment.gateway';
import { IRealTimeService } from '../../../domain/adapters/real-time.service';
import { Money } from '../../../domain/value-objects/money.value-object';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object';
import { PayoutTransaction } from '../../../domain/entities/payout-transaction.entity';
import {
    EntityNotFoundException,
    BusinessRuleException,
    InvalidStateException,
} from '../../../domain/exceptions/domain.exception';

export interface ProcessPayoutInput {
    collectionId: string;
    processedBy: string;
}

@Injectable()
export class ProcessPayoutUseCase extends BaseUseCase<ProcessPayoutInput, PayoutTransaction> {
    constructor(
        @Inject('ILogger') logger: ILogger,
        @Inject('IPayoutRepository') private readonly payoutRepository: IPayoutRepository,
        @Inject('ILoanRepository') private readonly loanRepository: ILoanRepository,
        @Inject('ICollectionRepository') private readonly collectionRepository: ICollectionRepository,
        @Inject('IPaymentGateway') private readonly paymentGateway: IPaymentGateway,
        @Inject('IRealTimeService') private readonly realTimeService: IRealTimeService,
    ) {
        super(logger);
    }

    async validate(input: ProcessPayoutInput): Promise<void> {
        if (!input.collectionId || !UUIDv7.isValid(input.collectionId)) {
            throw new Error('Invalid collection ID');
        }

        if (!input.processedBy || !UUIDv7.isValid(input.processedBy)) {
            throw new Error('Invalid processor ID');
        }
    }

    async execute(input: ProcessPayoutInput): Promise<PayoutTransaction> {
        const collectionId = new UUIDv7(input.collectionId);
        const processorId = new UUIDv7(input.processedBy);

        // Get collection
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) {
            throw new EntityNotFoundException('Collection', input.collectionId);
        }

        // Check if collection is verified
        if (!collection.isVerified()) {
            throw new InvalidStateException(
                'Collection',
                collection.getStatus(),
                'VERIFIED'
            );
        }

        // Check if already paid
        if (collection.isPaid()) {
            throw new BusinessRuleException('Collection already paid', 'ALREADY_PAID');
        }

        // Calculate payout (with loan recovery)
        // This would use CalculatePayoutUseCase internally
        const payoutCalculation = await this.calculatePayout(
            collection.getFarmerId(),
            collection.getCalculatedPayoutAmount()
        );

        // Create payout transaction entity
        const payoutTransaction = PayoutTransaction.create({
            collectionId,
            farmerId: collection.getFarmerId(),
            grossAmount: payoutCalculation.grossAmount,
            loanRecoveryAmount: payoutCalculation.loanRecovery,
            netAmount: payoutCalculation.netAmount,
            processorId,
            paymentMethod: 'MPESA', // Would come from farmer profile
        });

        // Process payment via payment gateway
        const paymentResult = await this.paymentGateway.initiatePayment({
            amount: payoutTransaction.getNetAmount(),
            currency: 'KES',
            customer: {
                phoneNumber: await this.getFarmerPhoneNumber(collection.getFarmerId()),
            },
            metadata: {
                collectionId: collection.getId().toString(),
                farmerId: collection.getFarmerId().toString(),
            },
        });

        if (paymentResult.status === 'FAILED') {
            throw new BusinessRuleException(
                `Payment failed: ${paymentResult.message}`,
                'PAYMENT_FAILED'
            );
        }

        // Update payout transaction with payment details
        payoutTransaction.updatePaymentDetails(
            paymentResult.transactionId,
            paymentResult.providerReference,
            paymentResult.status === 'SUCCESS' ? 'COMPLETED' : 'PENDING'
        );

        // Save payout transaction
        const savedTransaction = await this.payoutRepository.save(payoutTransaction);

        // If payment successful, update collection status and apply loan recovery
        if (paymentResult.status === 'SUCCESS') {
            await Promise.all([
                // Mark collection as paid
                this.collectionRepository.update(
                    collection.markAsPaid()
                ),
                // Apply loan recovery
                this.applyLoanRecovery(
                    collection.getFarmerId(),
                    payoutCalculation.loanRecovery
                ),
            ]);

            // Emit real-time events
            await Promise.all([
                this.realTimeService.emitToUser(
                    collection.getFarmerId(),
                    'payout:completed',
                    {
                        transactionId: savedTransaction.getId().toString(),
                        amount: payoutTransaction.getNetAmount().getAmount(),
                        collectionId: collection.getId().toString(),
                    }
                ),
                this.realTimeService.emitToRoom(
                    'finance:dashboard',
                    'payout:processed',
                    {
                        transactionId: savedTransaction.getId().toString(),
                        farmerId: collection.getFarmerId().toString(),
                        amount: payoutTransaction.getNetAmount().getAmount(),
                        processorId: processorId.toString(),
                    }
                ),
            ]);
        }

        this.logger.info(
            'ProcessPayoutUseCase',
            'Payout processed successfully',
            {
                collectionId: collection.getId().toString(),
                transactionId: savedTransaction.getId().toString(),
                netAmount: payoutTransaction.getNetAmount().getAmount(),
                loanRecovery: payoutCalculation.loanRecovery.getAmount(),
                paymentStatus: paymentResult.status,
            }
        );

        return savedTransaction;
    }

    private async calculatePayout(
        farmerId: UUIDv7,
        grossAmount: Money
    ): Promise<{
        grossAmount: Money;
        loanRecovery: Money;
        netAmount: Money;
    }> {
        // This would use CalculatePayoutUseCase
        // Simplified for example
        const loanBalance = await this.loanRepository.getOutstandingBalance(farmerId);
        const recoveryCap = 0.6; // From config
        const maxRecoverable = grossAmount.multiply(recoveryCap);

        const loanRecovery = loanBalance.isGreaterThan(maxRecoverable)
            ? maxRecoverable
            : loanBalance;

        const netAmount = grossAmount.subtract(loanRecovery);

        return { grossAmount, loanRecovery, netAmount };
    }

    private async getFarmerPhoneNumber(farmerId: UUIDv7): Promise<string> {
        // Would fetch from user repository
        return '+254700000000';
    }

    private async applyLoanRecovery(
        farmerId: UUIDv7,
        amount: Money
    ): Promise<void> {
        if (amount.isGreaterThan(Money.zero())) {
            await this.loanRepository.applyPayment(farmerId, amount);
        }
    }
}