import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';

export enum CollectionGrade {
    A = 'A',
    B = 'B',
    C = 'C',
}

export enum CollectionStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    DISPUTED = 'DISPUTED',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
    WASTED = 'WASTED',
}

export class CollectionCreatedEvent extends DomainEvent {
    constructor(
        public readonly collectionId: UUIDv7,
        public readonly farmerId: UUIDv7,
        public readonly agentId: UUIDv7,
        public readonly amount: Money,
    ) {
        super();
    }

    getEventName(): string {
        return 'CollectionCreated';
    }
}

export class CollectionVerifiedEvent extends DomainEvent {
    constructor(
        public readonly collectionId: UUIDv7,
        public readonly verifiedBy: UUIDv7,
    ) {
        super();
    }

    getEventName(): string {
        return 'CollectionVerified';
    }
}

export class Collection extends Entity<UUIDv7> {
    private storeAgentId: UUIDv7;
    private farmerId: UUIDv7;
    private produceTypeId: UUIDv7;
    private weightKg: number;
    private qualityGrade: CollectionGrade;
    private appliedRate: Money;
    private calculatedPayoutAmount: Money;
    private status: CollectionStatus;
    private notes: string | null;
    private collectedAt: Date;
    private verifiedAt: Date | null;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: UUIDv7,
        storeAgentId: UUIDv7,
        farmerId: UUIDv7,
        produceTypeId: UUIDv7,
        weightKg: number,
        qualityGrade: CollectionGrade,
        appliedRate: Money,
        calculatedPayoutAmount: Money,
        collectedAt: Date,
    ) {
        super(id);
        this.storeAgentId = storeAgentId;
        this.farmerId = farmerId;
        this.produceTypeId = produceTypeId;
        this.weightKg = weightKg;
        this.qualityGrade = qualityGrade;
        this.appliedRate = appliedRate;
        this.calculatedPayoutAmount = calculatedPayoutAmount;
        this.status = CollectionStatus.PENDING;
        this.notes = null;
        this.collectedAt = collectedAt;
        this.verifiedAt = null;
        const now = new Date();
        this.createdAt = now;
        this.updatedAt = now;

        this.addDomainEvent(
            new CollectionCreatedEvent(id, farmerId, storeAgentId, calculatedPayoutAmount)
        );
    }

    static create(props: {
        storeAgentId: UUIDv7;
        farmerId: UUIDv7;
        produceTypeId: UUIDv7;
        weightKg: number;
        qualityGrade: CollectionGrade;
        appliedRate: Money;
        calculatedPayoutAmount: Money;
        collectedAt: Date;
    }): Collection {
        if (props.weightKg <= 0) {
            throw new Error('Weight must be positive');
        }

        if (props.calculatedPayoutAmount.isLessThan(Money.zero())) {
            throw new Error('Payout amount cannot be negative');
        }

        return new Collection(
            UUIDv7.generate(),
            props.storeAgentId,
            props.farmerId,
            props.produceTypeId,
            props.weightKg,
            props.qualityGrade,
            props.appliedRate,
            props.calculatedPayoutAmount,
            props.collectedAt,
        );
    }

    // Getters
    getStoreAgentId(): UUIDv7 { return this.storeAgentId; }
    getFarmerId(): UUIDv7 { return this.farmerId; }
    getProduceTypeId(): UUIDv7 { return this.produceTypeId; }
    getWeightKg(): number { return this.weightKg; }
    getQualityGrade(): CollectionGrade { return this.qualityGrade; }
    getAppliedRate(): Money { return this.appliedRate; }
    getCalculatedPayoutAmount(): Money { return this.calculatedPayoutAmount; }
    getStatus(): CollectionStatus { return this.status; }
    getNotes(): string | null { return this.notes; }
    getCollectedAt(): Date { return this.collectedAt; }
    getVerifiedAt(): Date | null { return this.verifiedAt; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }

    // Business methods
    verify(verifiedBy: UUIDv7, notes?: string): void {
        if (this.status !== CollectionStatus.PENDING) {
            throw new Error('Only pending collections can be verified');
        }

        this.status = CollectionStatus.VERIFIED;
        this.verifiedAt = new Date();
        this.notes = notes || null;
        this.markAsUpdated();

        this.addDomainEvent(new CollectionVerifiedEvent(this.id, verifiedBy));
    }

    markAsPaid(): void {
        if (this.status !== CollectionStatus.VERIFIED) {
            throw new Error('Only verified collections can be marked as paid');
        }

        this.status = CollectionStatus.PAID;
        this.markAsUpdated();
    }

    dispute(notes: string): void {
        if (this.status !== CollectionStatus.PENDING && this.status !== CollectionStatus.VERIFIED) {
            throw new Error('Cannot dispute a collection in its current state');
        }

        this.status = CollectionStatus.DISPUTED;
        this.notes = notes;
        this.markAsUpdated();
    }

    cancel(reason: string): void {
        if (this.status === CollectionStatus.PAID) {
            throw new Error('Cannot cancel a paid collection');
        }

        this.status = CollectionStatus.CANCELLED;
        this.notes = reason;
        this.markAsUpdated();
    }

    markAsWasted(reason: string): void {
        this.status = CollectionStatus.WASTED;
        this.notes = reason;
        this.markAsUpdated();
    }

    private markAsUpdated(): void {
        this.updatedAt = new Date();
    }

    isPaid(): boolean {
        return this.status === CollectionStatus.PAID;
    }

    isVerified(): boolean {
        return this.status === CollectionStatus.VERIFIED || this.status === CollectionStatus.PAID;
    }
}