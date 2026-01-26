import { WastageRecord } from '../entities/wastage-record.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';

export interface IWastageRecordRepository {
  save(wastageRecord: WastageRecord): Promise<WastageRecord>;
  findById(id: UUIDv7): Promise<WastageRecord | null>;
  findByCollectionId(collectionId: UUIDv7): Promise<WastageRecord | null>;
  findByAgentId(agentId: UUIDv7, date: Date): Promise<WastageRecord[]>;
}
