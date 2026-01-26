import {
  WastageRecord,
  WastageReason,
} from '../../../domain/entities/wastage-record.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';

export class WastageRecordMapper {
  static toDomain(raw: any): WastageRecord {
    if (!raw) return null;

    return WastageRecord.reconstitute({
      id: new UUIDv7(raw.id),
      collectionId: raw.collection_id ? new UUIDv7(raw.collection_id) : null,
      agentId: new UUIDv7(raw.agent_id),
      produceTypeId: new UUIDv7(raw.produce_type_id),
      weightKg: parseFloat(raw.weight_kg),
      reason: raw.reason as WastageReason,
      declaredAt: new Date(raw.declared_at),
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    });
  }

  static toPersistence(entity: WastageRecord): any {
    return {
      id: entity.getId().toString(),
      collection_id: entity.getCollectionId()?.toString() || null,
      agent_id: entity.getAgentId().toString(),
      produce_type_id: entity.getProduceTypeId().toString(),
      weight_kg: entity.getWeightKg(),
      reason: entity.getReason(),
      declared_at: entity.getDeclaredAt(),
      created_at: entity.getCreatedAt(),
      updated_at: entity.getUpdatedAt(),
      partition_date: entity.getDeclaredAt(), // Partition by declared date
    };
  }
}
