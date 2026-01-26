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
var _a;
import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { CollectionStatus, } from '../../../domain/entities/collection.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { IInvoiceService } from '../../services/invoice.service.ts';
import { EntityNotFoundException, InvalidStateException, BusinessRuleException, } from '../../../domain/exceptions/domain.exception.ts';
let VerifyCollectionUseCase = class VerifyCollectionUseCase extends BaseUseCase {
    collectionRepository;
    userRepository;
    realTimeService;
    invoiceService;
    constructor(logger, collectionRepository, userRepository, realTimeService, invoiceService) {
        super(logger);
        this.collectionRepository = collectionRepository;
        this.userRepository = userRepository;
        this.realTimeService = realTimeService;
        this.invoiceService = invoiceService;
    }
    async validate(input) {
        if (!input.collectionId || !UUIDv7.isValid(input.collectionId)) {
            throw new Error('Invalid collection ID');
        }
        if (!input.verifiedBy || !UUIDv7.isValid(input.verifiedBy)) {
            throw new Error('Invalid verifier ID');
        }
    }
    async execute(input) {
        const collection = await this.collectionRepository.findById(new UUIDv7(input.collectionId));
        if (!collection) {
            throw new EntityNotFoundException('Collection', input.collectionId);
        }
        const verifier = await this.userRepository.findById(new UUIDv7(input.verifiedBy));
        if (!verifier || !verifier.canVerifyCollections()) {
            throw new BusinessRuleException('User cannot verify collections', 'UNAUTHORIZED_VERIFICATION');
        }
        if (collection.getStatus() !== CollectionStatus.PENDING) {
            throw new InvalidStateException('Collection', collection.getStatus(), CollectionStatus.PENDING);
        }
        collection.verify(verifier.getId(), input.notes);
        const updatedCollection = await this.collectionRepository.update(collection);
        const invoice = await this.invoiceService.generateForCollection(updatedCollection);
        await Promise.all([
            this.realTimeService.emitToUser(collection.getFarmerId(), 'collection:verified', {
                collectionId: collection.getId().toString(),
                amount: collection.getCalculatedPayoutAmount().getAmount(),
                verifiedAt: collection.getVerifiedAt(),
            }),
            this.realTimeService.emitToUser(collection.getStoreAgentId(), 'collection:verified:agent', {
                collectionId: collection.getId().toString(),
                farmerId: collection.getFarmerId().toString(),
            }),
            this.realTimeService.emitToRoom('admin:dashboard', 'collection:verified', {
                collectionId: collection.getId().toString(),
                verifiedBy: verifier.getId().toString(),
                amount: collection.getCalculatedPayoutAmount().getAmount(),
            }),
        ]);
        this.logger.info('VerifyCollectionUseCase', 'Collection verified successfully', {
            collectionId: collection.getId().toString(),
            verifiedBy: verifier.getId().toString(),
            invoiceId: invoice.getId().toString(),
        });
        return updatedCollection;
    }
};
VerifyCollectionUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('ICollectionRepository')),
    __param(2, Inject('IUserRepository')),
    __param(3, Inject('IRealTimeService')),
    __param(4, Inject('IInvoiceService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, typeof (_a = typeof IInvoiceService !== "undefined" && IInvoiceService) === "function" ? _a : Object])
], VerifyCollectionUseCase);
export { VerifyCollectionUseCase };
//# sourceMappingURL=verify-collection.use-case.js.map