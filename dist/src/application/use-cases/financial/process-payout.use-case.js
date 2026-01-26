var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { IPayoutRepository } from '../../../domain/repositories/payout.repository.ts';
import { ILoanRepository } from '../../../domain/repositories/loan.repository.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { PayoutTransaction } from '../../../domain/entities/payout-transaction.entity.ts';
import { EntityNotFoundException, BusinessRuleException, InvalidStateException, } from '../../../domain/exceptions/domain.exception.ts';
let ProcessPayoutUseCase = class ProcessPayoutUseCase extends BaseUseCase {
    payoutRepository;
    loanRepository;
    collectionRepository;
    paymentGateway;
    realTimeService;
    constructor(logger, payoutRepository, loanRepository, collectionRepository, paymentGateway, realTimeService) {
        super(logger);
        this.payoutRepository = payoutRepository;
        this.loanRepository = loanRepository;
        this.collectionRepository = collectionRepository;
        this.paymentGateway = paymentGateway;
        this.realTimeService = realTimeService;
    }
    async validate(input) {
        if (!input.collectionId || !UUIDv7.isValid(input.collectionId)) {
            throw new Error('Invalid collection ID');
        }
        if (!input.processedBy || !UUIDv7.isValid(input.processedBy)) {
            throw new Error('Invalid processor ID');
        }
    }
    async execute(input) {
        const collectionId = new UUIDv7(input.collectionId);
        const processorId = new UUIDv7(input.processedBy);
        const collection = await this.collectionRepository.findById(collectionId);
        if (!collection) {
            throw new EntityNotFoundException('Collection', input.collectionId);
        }
        if (!collection.isVerified()) {
            throw new InvalidStateException('Collection', collection.getStatus(), 'VERIFIED');
        }
        if (collection.isPaid()) {
            throw new BusinessRuleException('Collection already paid', 'ALREADY_PAID');
        }
        const payoutCalculation = await this.calculatePayout(collection.getFarmerId(), collection.getCalculatedPayoutAmount());
        const payoutTransaction = PayoutTransaction.create({
            collectionId,
            farmerId: collection.getFarmerId(),
            grossAmount: payoutCalculation.grossAmount,
            loanRecoveryAmount: payoutCalculation.loanRecovery,
            netAmount: payoutCalculation.netAmount,
            processorId,
            paymentMethod: 'MPESA',
        });
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
            throw new BusinessRuleException(`Payment failed: ${paymentResult.message}`, 'PAYMENT_FAILED');
        }
        payoutTransaction.updatePaymentDetails(paymentResult.transactionId, paymentResult.providerReference, paymentResult.status === 'SUCCESS' ? 'COMPLETED' : 'PENDING');
        const savedTransaction = await this.payoutRepository.save(payoutTransaction);
        if (paymentResult.status === 'SUCCESS') {
            await Promise.all([
                this.collectionRepository.update(collection.markAsPaid()),
                this.applyLoanRecovery(collection.getFarmerId(), payoutCalculation.loanRecovery),
            ]);
            await Promise.all([
                this.realTimeService.emitToUser(collection.getFarmerId(), 'payout:completed', {
                    transactionId: savedTransaction.getId().toString(),
                    amount: payoutTransaction.getNetAmount().getAmount(),
                    collectionId: collection.getId().toString(),
                }),
                this.realTimeService.emitToRoom('finance:dashboard', 'payout:processed', {
                    transactionId: savedTransaction.getId().toString(),
                    farmerId: collection.getFarmerId().toString(),
                    amount: payoutTransaction.getNetAmount().getAmount(),
                    processorId: processorId.toString(),
                }),
            ]);
        }
        this.logger.info('ProcessPayoutUseCase', 'Payout processed successfully', {
            collectionId: collection.getId().toString(),
            transactionId: savedTransaction.getId().toString(),
            netAmount: payoutTransaction.getNetAmount().getAmount(),
            loanRecovery: payoutCalculation.loanRecovery.getAmount(),
            paymentStatus: paymentResult.status,
        });
        return savedTransaction;
    }
    async calculatePayout(farmerId, grossAmount) {
        const loanBalance = await this.loanRepository.getOutstandingBalance(farmerId);
        const recoveryCap = 0.6;
        const maxRecoverable = grossAmount.multiply(recoveryCap);
        const loanRecovery = loanBalance.isGreaterThan(maxRecoverable)
            ? maxRecoverable
            : loanBalance;
        const netAmount = grossAmount.subtract(loanRecovery);
        return { grossAmount, loanRecovery, netAmount };
    }
    async getFarmerPhoneNumber(farmerId) {
        return '+254700000000';
    }
    async applyLoanRecovery(farmerId, amount) {
        if (amount.isGreaterThan(Money.zero())) {
            await this.loanRepository.applyPayment(farmerId, amount);
        }
    }
};
ProcessPayoutUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('IPayoutRepository')),
    __param(2, Inject('ILoanRepository')),
    __param(3, Inject('ICollectionRepository')),
    __param(4, Inject('IPaymentGateway')),
    __param(5, Inject('IRealTimeService')),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof IPayoutRepository !== "undefined" && IPayoutRepository) === "function" ? _a : Object, typeof (_b = typeof ILoanRepository !== "undefined" && ILoanRepository) === "function" ? _b : Object, Object, Object, Object])
], ProcessPayoutUseCase);
export { ProcessPayoutUseCase };
//# sourceMappingURL=process-payout.use-case.js.map