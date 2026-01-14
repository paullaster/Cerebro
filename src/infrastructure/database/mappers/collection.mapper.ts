import { Collection, CollectionStatus, CollectionGrade } from '../../../domain/entities/collection.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object';
import { Money } from '../../../domain/value-objects/money.value-object';

export class CollectionMapper {
    static toDomain(raw: any): Collection {
        if (!raw) return null;

        return Collection.create({
            storeAgentId: new UUIDv7(raw.store_agent_id),
            farmerId: new UUIDv7(raw.farmer_id),
            produceTypeId: new UUIDv7(raw.produce_type_id),
            weightKg: parseFloat(raw.weight_kg),
            qualityGrade: raw.quality_grade as CollectionGrade,
            appliedRate: new Money(raw.applied_rate),
            calculatedPayoutAmount: new Money(raw.calculated_payout_amount),
            collectedAt: new Date(raw.collected_at),
        });
    }

    static toPersistence(collection: Collection): any {
        return {
            id: collection.getId().toString(),
            store_agent_id: collection.getStoreAgentId().toString(),
            farmer_id: collection.getFarmerId().toString(),
            produce_type_id: collection.getProduceTypeId().toString(),
            weight_kg: collection.getWeightKg(),
            quality_grade: collection.getQualityGrade(),
            applied_rate: collection.getAppliedRate().getAmount(),
            calculated_payout_amount: collection.getCalculatedPayoutAmount().getAmount(),
            status: collection.getStatus(),
            notes: collection.getNotes(),
            collected_at: collection.getCollectedAt(),
            verified_at: collection.getVerifiedAt(),
            created_at: collection.getCreatedAt(),
            updated_at: collection.getUpdatedAt(),
            partition_date: collection.getCollectedAt(), // Use collected_at for partitioning
        };
    }
}