import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export declare enum WastageReason {
    SPOILAGE = "SPOILAGE",
    THEFT = "THEFT",
    QUALITY_REJECTION = "QUALITY_REJECTION"
}
export declare class WastageRecord extends Entity<UUIDv7> {
    private collectionId;
    private agentId;
    private produceTypeId;
    private weightKg;
    private reason;
    private declaredAt;
    private createdAt;
    private updatedAt;
    private constructor();
    static create(props: {
        collectionId?: UUIDv7 | null;
        agentId: UUIDv7;
        produceTypeId: UUIDv7;
        weightKg: number;
        reason: WastageReason;
        declaredAt?: Date;
    }): WastageRecord;
    getCollectionId(): UUIDv7 | null;
    getAgentId(): UUIDv7;
    getProduceTypeId(): UUIDv7;
    getWeightKg(): number;
    getReason(): WastageReason;
    getDeclaredAt(): Date;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
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
    }): WastageRecord;
}
