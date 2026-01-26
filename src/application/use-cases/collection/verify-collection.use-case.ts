import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import {
  Collection,
  CollectionStatus,
} from '../../../domain/entities/collection.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { IRealTimeService } from '../../../domain/adapters/real-time.service.ts';
import { IInvoiceService } from '../../services/invoice.service.ts';
import {
  EntityNotFoundException,
  InvalidStateException,
  BusinessRuleException,
} from '../../../domain/exceptions/domain.exception.ts';

export interface VerifyCollectionInput {
  collectionId: string;
  verifiedBy: string;
  notes?: string;
}

@Injectable()
export class VerifyCollectionUseCase extends BaseUseCase<
  VerifyCollectionInput,
  Collection
> {
  constructor(
    @Inject('ILogger') logger: ILogger,
    @Inject('ICollectionRepository')
    private readonly collectionRepository: ICollectionRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRealTimeService')
    private readonly realTimeService: IRealTimeService,
    @Inject('IInvoiceService') private readonly invoiceService: IInvoiceService,
  ) {
    super(logger);
  }

  async validate(input: VerifyCollectionInput): Promise<void> {
    if (!input.collectionId || !UUIDv7.isValid(input.collectionId)) {
      throw new Error('Invalid collection ID');
    }

    if (!input.verifiedBy || !UUIDv7.isValid(input.verifiedBy)) {
      throw new Error('Invalid verifier ID');
    }
  }

  async execute(input: VerifyCollectionInput): Promise<Collection> {
    const collection = await this.collectionRepository.findById(
      new UUIDv7(input.collectionId),
    );
    if (!collection) {
      throw new EntityNotFoundException('Collection', input.collectionId);
    }

    const verifier = await this.userRepository.findById(
      new UUIDv7(input.verifiedBy),
    );
    if (!verifier || !verifier.canVerifyCollections()) {
      throw new BusinessRuleException(
        'User cannot verify collections',
        'UNAUTHORIZED_VERIFICATION',
      );
    }

    // Check if collection can be verified
    if (collection.getStatus() !== CollectionStatus.PENDING) {
      throw new InvalidStateException(
        'Collection',
        collection.getStatus(),
        CollectionStatus.PENDING,
      );
    }

    // Verify collection
    collection.verify(verifier.getId(), input.notes);

    // Update in repository
    const updatedCollection =
      await this.collectionRepository.update(collection);

    // Generate invoice (atomic operation)
    const invoice =
      await this.invoiceService.generateForCollection(updatedCollection);

    // Emit real-time events
    await Promise.all([
      this.realTimeService.emitToUser(
        collection.getFarmerId(),
        'collection:verified',
        {
          collectionId: collection.getId().toString(),
          amount: collection.getCalculatedPayoutAmount().getAmount(),
          verifiedAt: collection.getVerifiedAt(),
        },
      ),
      this.realTimeService.emitToUser(
        collection.getStoreAgentId(),
        'collection:verified:agent',
        {
          collectionId: collection.getId().toString(),
          farmerId: collection.getFarmerId().toString(),
        },
      ),
      this.realTimeService.emitToRoom(
        'admin:dashboard',
        'collection:verified',
        {
          collectionId: collection.getId().toString(),
          verifiedBy: verifier.getId().toString(),
          amount: collection.getCalculatedPayoutAmount().getAmount(),
        },
      ),
    ]);

    this.logger.info(
      'VerifyCollectionUseCase',
      'Collection verified successfully',
      {
        collectionId: collection.getId().toString(),
        verifiedBy: verifier.getId().toString(),
        invoiceId: invoice.getId().toString(),
      },
    );

    return updatedCollection;
  }
}
