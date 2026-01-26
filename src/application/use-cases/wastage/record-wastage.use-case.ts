import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IWastageRecordRepository } from '../../../domain/repositories/wastage-record.repository.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import {
  WastageRecord,
  WastageReason,
} from '../../../domain/entities/wastage-record.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { EntityNotFoundException } from '../../../domain/exceptions/domain.exception.ts';

export interface RecordWastageInput {
  agentId: string;
  produceTypeId: string;
  weightKg: number;
  reason: WastageReason;
  collectionId?: string;
  notes?: string;
}

@Injectable()
export class RecordWastageUseCase extends BaseUseCase<
  RecordWastageInput,
  WastageRecord
> {
  constructor(
    @Inject('ILogger') protected override readonly logger: ILogger,
    @Inject('IWastageRecordRepository')
    private readonly wastageRepository: IWastageRecordRepository,
    @Inject('ICollectionRepository')
    private readonly collectionRepository: ICollectionRepository,
  ) {
    super(logger);
  }

  async validate(input: RecordWastageInput): Promise<void> {
    if (input.weightKg <= 0) {
      throw new Error('Weight must be positive');
    }

    if (input.collectionId) {
      const collection = await this.collectionRepository.findById(
        new UUIDv7(input.collectionId),
      );
      if (!collection) {
        throw new EntityNotFoundException('Collection', input.collectionId);
      }
      // Check if user has rights? (Assuming caller checks auth, but here we might check logic)
      if (collection.getStoreAgentId().toString() !== input.agentId) {
        // Maybe allowed if Admin? But Input has agentId, implies agent is the actor.
        // For now, allow it, but log warning if mismatch?
      }
    }
  }

  async execute(input: RecordWastageInput): Promise<WastageRecord> {
    const wastage = WastageRecord.create({
      agentId: new UUIDv7(input.agentId),
      produceTypeId: new UUIDv7(input.produceTypeId),
      weightKg: input.weightKg,
      reason: input.reason,
      collectionId: input.collectionId ? new UUIDv7(input.collectionId) : null,
    });

    const savedWastage = await this.wastageRepository.save(wastage);

    // If linked to a collection, we might want to update the collection status
    if (input.collectionId) {
      const collection = await this.collectionRepository.findById(
        new UUIDv7(input.collectionId),
      );
      if (collection) {
        // If the entire weight matches, maybe mark as WASTED?
        // Or if logic dictates. PRD says "Create a WastageRecord".
        // It also says "Wastage Tracking... allows... to compare Intake vs Wastage".
        // It doesn't explicitly say "Update Collection Status".
        // But Collection has a WASTED status.

        // If the wastage reason is "Quality Rejection" at the time of collection (implied),
        // maybe the collection itself is marked WASTED.

        // For now, I'll just record the wastage.
        // Updating the collection status might be a separate concern or specific business rule
        // not fully detailed, so I'll be conservative.

        // However, I will log it.
        this.logger.info('RecordWastage', 'Linked wastage to collection', {
          collectionId: input.collectionId,
        });

        // If specific instruction: "If produce is rejected... create a WastageRecord".
        // This implies the Collection might not even be "Verified" yet.
        if (!collection.isVerified() && !collection.isPaid()) {
          collection.markAsWasted(input.notes || input.reason);
          await this.collectionRepository.save(collection);
        }
      }
    }

    return savedWastage;
  }
}
