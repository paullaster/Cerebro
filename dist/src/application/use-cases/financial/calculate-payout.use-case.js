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
import { ILoanRepository } from '../../../domain/repositories/loan.repository.ts';
import { IConfigService } from '../../services/config.service.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { BusinessRuleException, } from '../../../domain/exceptions/domain.exception.ts';
let CalculatePayoutUseCase = class CalculatePayoutUseCase extends BaseUseCase {
    loanRepository;
    collectionRepository;
    configService;
    loanRecoveryCap;
    constructor(logger, loanRepository, collectionRepository, configService) {
        super(logger);
        this.loanRepository = loanRepository;
        this.collectionRepository = collectionRepository;
        this.configService = configService;
        this.loanRecoveryCap = configService.getLoanRecoveryCap();
    }
    async validate(input) {
        if (!input.farmerId || !UUIDv7.isValid(input.farmerId)) {
            throw new Error('Invalid farmer ID');
        }
        if (input.collectionAmount.isLessThan(Money.zero())) {
            throw new Error('Collection amount cannot be negative');
        }
    }
    async execute(input) {
        const farmerId = new UUIDv7(input.farmerId);
        const loanBalance = await this.loanRepository.getOutstandingBalance(farmerId);
        const maxRecoverable = input.collectionAmount.multiply(this.loanRecoveryCap);
        let loanRecovery;
        let livingWageProtected = false;
        if (loanBalance.isGreaterThan(Money.zero())) {
            if (loanBalance.isGreaterThan(maxRecoverable)) {
                loanRecovery = maxRecoverable;
                livingWageProtected = true;
                this.logger.info('CalculatePayoutUseCase', 'Living wage guardrail activated', {
                    farmerId: farmerId.toString(),
                    loanBalance: loanBalance.getAmount(),
                    maxRecoverable: maxRecoverable.getAmount(),
                    collectionAmount: input.collectionAmount.getAmount(),
                });
            }
            else {
                loanRecovery = loanBalance;
            }
        }
        else {
            loanRecovery = Money.zero();
        }
        const netAmount = input.collectionAmount.subtract(loanRecovery);
        if (netAmount.isLessThan(Money.zero())) {
            throw new BusinessRuleException('Net payout cannot be negative', 'NEGATIVE_NET_PAYOUT');
        }
        const recoveryRate = loanRecovery.isZero()
            ? 0
            : (loanRecovery.getAmount() / input.collectionAmount.getAmount()) * 100;
        this.logger.debug('CalculatePayoutUseCase', 'Payout calculation completed', {
            farmerId: farmerId.toString(),
            grossAmount: input.collectionAmount.getAmount(),
            loanRecovery: loanRecovery.getAmount(),
            netAmount: netAmount.getAmount(),
            recoveryRate,
            livingWageProtected,
        });
        return {
            grossAmount: input.collectionAmount,
            loanRecovery,
            netAmount,
            recoveryRate,
            livingWageProtected,
        };
    }
};
CalculatePayoutUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('ILoanRepository')),
    __param(2, Inject('ICollectionRepository')),
    __param(3, Inject('IConfigService')),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof ILoanRepository !== "undefined" && ILoanRepository) === "function" ? _a : Object, Object, typeof (_b = typeof IConfigService !== "undefined" && IConfigService) === "function" ? _b : Object])
], CalculatePayoutUseCase);
export { CalculatePayoutUseCase };
//# sourceMappingURL=calculate-payout.use-case.js.map