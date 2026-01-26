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
import { WastageRecord, } from '../../../domain/entities/wastage-record.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { EntityNotFoundException } from '../../../domain/exceptions/domain.exception.ts';
let RecordWastageUseCase = class RecordWastageUseCase extends BaseUseCase {
    logger;
    wastageRepository;
    collectionRepository;
    constructor(logger, wastageRepository, collectionRepository) {
        super(logger);
        this.logger = logger;
        this.wastageRepository = wastageRepository;
        this.collectionRepository = collectionRepository;
    }
    async validate(input) {
        if (input.weightKg <= 0) {
            throw new Error('Weight must be positive');
        }
        if (input.collectionId) {
            const collection = await this.collectionRepository.findById(new UUIDv7(input.collectionId));
            if (!collection) {
                throw new EntityNotFoundException('Collection', input.collectionId);
            }
            if (collection.getStoreAgentId().toString() !== input.agentId) {
            }
        }
    }
    async execute(input) {
        const wastage = WastageRecord.create({
            agentId: new UUIDv7(input.agentId),
            produceTypeId: new UUIDv7(input.produceTypeId),
            weightKg: input.weightKg,
            reason: input.reason,
            collectionId: input.collectionId ? new UUIDv7(input.collectionId) : null,
        });
        const savedWastage = await this.wastageRepository.save(wastage);
        if (input.collectionId) {
            const collection = await this.collectionRepository.findById(new UUIDv7(input.collectionId));
            if (collection) {
                this.logger.info('RecordWastage', 'Linked wastage to collection', {
                    collectionId: input.collectionId,
                });
                if (!collection.isVerified() && !collection.isPaid()) {
                    collection.markAsWasted(input.notes || input.reason);
                    await this.collectionRepository.save(collection);
                }
            }
        }
        return savedWastage;
    }
};
RecordWastageUseCase = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('IWastageRecordRepository')),
    __param(2, Inject('ICollectionRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], RecordWastageUseCase);
export { RecordWastageUseCase };
//# sourceMappingURL=record-wastage.use-case.js.map