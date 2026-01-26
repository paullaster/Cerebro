import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';

export enum WastageReason {
  SPOILAGE = 'SPOILAGE',
  THEFT = 'THEFT',
  QUALITY_REJECTION = 'QUALITY_REJECTION',
}

export class WastageRecord extends Entity<UUIDv7> {
  private collectionId: UUIDv7 | null;
  private agentId: UUIDv7;
  private produceTypeId: UUIDv7;
  private weightKg: number;
  private reason: WastageReason;
  private declaredAt: Date;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: UUIDv7,
    collectionId: UUIDv7 | null,
    agentId: UUIDv7,
    produceTypeId: UUIDv7,
    weightKg: number,
    reason: WastageReason,
    declaredAt: Date,
  ) {
    super(id);
    this.collectionId = collectionId;
    this.agentId = agentId;
    this.produceTypeId = produceTypeId;
    this.weightKg = weightKg;
    this.reason = reason;
    this.declaredAt = declaredAt;
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  static create(props: {
    collectionId?: UUIDv7 | null;
    agentId: UUIDv7;
    produceTypeId: UUIDv7;
    weightKg: number;
    reason: WastageReason;
    declaredAt?: Date;
  }): WastageRecord {
    if (props.weightKg <= 0) {
      throw new Error('Weight must be positive');
    }

    return new WastageRecord(
      UUIDv7.generate(),
      props.collectionId || null,
      props.agentId,
      props.produceTypeId,
      props.weightKg,
      props.reason,
      props.declaredAt || new Date(),
    );
  }

  // Getters
  getCollectionId(): UUIDv7 | null {
    return this.collectionId;
  }
  getAgentId(): UUIDv7 {
    return this.agentId;
  }
  getProduceTypeId(): UUIDv7 {
    return this.produceTypeId;
  }
  getWeightKg(): number {
    return this.weightKg;
  }
  getReason(): WastageReason {
    return this.reason;
  }
  getDeclaredAt(): Date {
    return this.declaredAt;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Reconstruct from persistence
  static reconstitute(props: {
    id: UUIDv7;
    collectionId: UUIDv7 | null;
    agentId: UUIDv7;
    produceTypeId: UUIDv7;
    weightKg: number;
    reason: WastageReason;
    declaredAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): WastageRecord {
    const entity = new WastageRecord(
      props.id,
      props.collectionId,
      props.agentId,
      props.produceTypeId,
      props.weightKg,
      props.reason,
      props.declaredAt,
    );
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }
}
