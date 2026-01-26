import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';
export declare enum CollectionGrade {
    A = "A",
    B = "B",
    C = "C"
}
export declare enum CollectionStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    DISPUTED = "DISPUTED",
    PAID = "PAID",
    CANCELLED = "CANCELLED",
    WASTED = "WASTED"
}
export declare class CollectionCreatedEvent extends DomainEvent {
    readonly collectionId: UUIDv7;
    readonly farmerId: UUIDv7;
    readonly agentId: UUIDv7;
    readonly amount: Money;
    constructor(collectionId: UUIDv7, farmerId: UUIDv7, agentId: UUIDv7, amount: Money);
    getEventName(): string;
}
export declare class CollectionVerifiedEvent extends DomainEvent {
    readonly collectionId: UUIDv7;
    readonly verifiedBy: UUIDv7;
    constructor(collectionId: UUIDv7, verifiedBy: UUIDv7);
    getEventName(): string;
}
export declare class Collection extends Entity<UUIDv7> {
    private storeAgentId;
    private farmerId;
    private produceTypeId;
    private weightKg;
    private qualityGrade;
    private appliedRate;
    private calculatedPayoutAmount;
    private status;
    private notes;
    private collectedAt;
    private verifiedAt;
    private createdAt;
    private updatedAt;
    private constructor();
    static create(props: {
        storeAgentId: UUIDv7;
        farmerId: UUIDv7;
        produceTypeId: UUIDv7;
        weightKg: number;
        qualityGrade: CollectionGrade;
        appliedRate: Money;
        calculatedPayoutAmount: Money;
        collectedAt: Date;
    }): Collection;
    getStoreAgentId(): UUIDv7;
    getFarmerId(): UUIDv7;
    getProduceTypeId(): UUIDv7;
    getWeightKg(): number;
    getQualityGrade(): CollectionGrade;
    getAppliedRate(): Money;
    getCalculatedPayoutAmount(): Money;
    getStatus(): CollectionStatus;
    getNotes(): string | null;
    getCollectedAt(): Date;
    getVerifiedAt(): Date | null;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    verify(verifiedBy: UUIDv7, notes?: string): void;
    markAsPaid(): void;
    dispute(notes: string): void;
    cancel(reason: string): void;
    markAsWasted(reason: string): void;
    private markAsUpdated;
    isPaid(): boolean;
    isVerified(): boolean;
}
