import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { ICollectionRepository } from '../../../domain/repositories/collection.repository.ts';
import {
  Collection,
  CollectionGrade,
} from '../../../domain/entities/collection.entity.ts';
import { Invoice } from '../../../domain/entities/invoice.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { IRealTimeService } from '../../../domain/adapters/real-time.service.ts';
// import { IMarketRateService } from ... // Need this for pricing

export interface CreateCollectionInput {
  storeAgentId: string;
  farmerId: string;
  produceTypeId: string;
  weightKg: number;
  qualityGrade: CollectionGrade;
  // Price might be calculated internally or passed? PRD says "Pricing Matrix Logic: Market Rates are set per produce."
  // "Logic: Final Price = Base Market Rate * Grade Multiplier."
  // So input shouldn't have price. UseCase fetches rate.
}

export interface CreateCollectionOutput {
  collectionId: string;
  invoiceId: string;
  payoutAmount: number;
}

@Injectable()
export class CreateCollectionUseCase extends BaseUseCase<
  CreateCollectionInput,
  CreateCollectionOutput
> {
  constructor(
    @Inject('ILogger') protected override readonly logger: ILogger,
    @Inject('ICollectionRepository')
    private readonly collectionRepository: ICollectionRepository,
    @Inject('IRealTimeService')
    private readonly realTimeService: IRealTimeService,
    // @Inject('IMarketRateService') private readonly marketRateService: IMarketRateService,
  ) {
    super(logger);
  }

  async validate(input: CreateCollectionInput): Promise<void> {
    if (input.weightKg <= 0) throw new Error('Weight must be positive');
    // Validate agent, farmer, produce exist (omitted for brevity, assume ID valid or DB constraint fails)
  }

  async execute(input: CreateCollectionInput): Promise<CreateCollectionOutput> {
    // 1. Fetch Market Rate (Mocked for now as service not ready)
    // const rate = await this.marketRateService.getRate(input.produceTypeId, new Date());
    const baseRate = new Money(100); // Placeholder
    const multiplier =
      input.qualityGrade === CollectionGrade.A
        ? 1.0
        : input.qualityGrade === CollectionGrade.B
          ? 0.85
          : 0.7;
    const appliedRate = baseRate.multiply(multiplier);

    const payoutAmount = appliedRate.multiply(input.weightKg);

    // 2. Create Collection
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

    // 3. Create Invoice
    const invoice = Invoice.create({
      collectionId: collection.getId(),
      amount: payoutAmount,
    });

    // 4. Atomic Save
    await this.collectionRepository.saveWithInvoice(collection, invoice);

    // 5. Real-time Notification
    // Notify Farmer (if they have app/dashboard)
    await this.realTimeService.emitToUser(
      new UUIDv7(input.farmerId),
      'collection:created',
      {
        collectionId: collection.getId().toString(),
        amount: payoutAmount.getAmount(),
        weight: input.weightKg,
      },
    );

    // Notify Admin
    await this.realTimeService.broadcast(
      'dashboard:live-feed',
      {
        type: 'COLLECTION',
        agentId: input.storeAgentId,
        amount: payoutAmount.getAmount(),
      },
      { namespace: 'dashboard' },
    );

    return {
      collectionId: collection.getId().toString(),
      invoiceId: invoice.getId().toString(),
      payoutAmount: payoutAmount.getAmount(),
    };
  }
}
