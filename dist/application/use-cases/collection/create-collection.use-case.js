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
import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { Collection, CollectionGrade, } from '../../../domain/entities/collection.entity.ts';
import { Invoice } from '../../../domain/entities/invoice.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
let CreateCollectionUseCase = class CreateCollectionUseCase extends BaseUseCase {
    logger;
    collectionRepository;
    realTimeService;
    constructor(logger, collectionRepository, realTimeService) {
        super(logger);
        this.logger = logger;
        this.collectionRepository = collectionRepository;
        this.realTimeService = realTimeService;
    }
    async validate(input) {
        if (input.weightKg <= 0)
            throw new Error('Weight must be positive');
    }
    async execute(input) {
        const baseRate = new Money(100);
        const multiplier = input.qualityGrade === CollectionGrade.A
            ? 1.0
            : input.qualityGrade === CollectionGrade.B
                ? 0.85
                : 0.7;
        const appliedRate = baseRate.multiply(multiplier);
        const payoutAmount = appliedRate.multiply(input.weightKg);
        const collection = Collection.create({
            storeAgentId: new UUIDv7(input.storeAgentId),
            farmerId: new UUIDv7(input.farmerId),
            produceTypeId: new UUIDv7(input.produceTypeId),
            weightKg: input.weightKg,
            qualityGrade: input.qualityGrade,
            appliedRate: appliedRate,
            calculatedPayoutAmount: payoutAmount,
            collectedAt: new Date(),
        });
        const invoice = Invoice.create({
            collectionId: collection.getId(),
            amount: payoutAmount,
        });
        await this.collectionRepository.saveWithInvoice(collection, invoice);
        await this.realTimeService.emitToUser(new UUIDv7(input.farmerId), 'collection:created', {
            collectionId: collection.getId().toString(),
            amount: payoutAmount.getAmount(),
            weight: input.weightKg,
        });
        await this.realTimeService.broadcast('dashboard:live-feed', {
            type: 'COLLECTION',
            agentId: input.storeAgentId,
            amount: payoutAmount.getAmount(),
        }, { namespace: 'dashboard' });
        return {
            collectionId: collection.getId().toString(),
            invoiceId: invoice.getId().toString(),
            payoutAmount: payoutAmount.getAmount(),
        };
    }
};
CreateCollectionUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('ICollectionRepository')),
    __param(2, Inject('IRealTimeService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], CreateCollectionUseCase);
export { CreateCollectionUseCase };
//# sourceMappingURL=create-collection.use-case.js.map