import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';
export var CollectionGrade;
(function (CollectionGrade) {
    CollectionGrade["A"] = "A";
    CollectionGrade["B"] = "B";
    CollectionGrade["C"] = "C";
})(CollectionGrade || (CollectionGrade = {}));
export var CollectionStatus;
(function (CollectionStatus) {
    CollectionStatus["PENDING"] = "PENDING";
    CollectionStatus["VERIFIED"] = "VERIFIED";
    CollectionStatus["DISPUTED"] = "DISPUTED";
    CollectionStatus["PAID"] = "PAID";
    CollectionStatus["CANCELLED"] = "CANCELLED";
    CollectionStatus["WASTED"] = "WASTED";
})(CollectionStatus || (CollectionStatus = {}));
export class CollectionCreatedEvent extends DomainEvent {
    collectionId;
    farmerId;
    agentId;
    amount;
    constructor(collectionId, farmerId, agentId, amount) {
        super();
        this.collectionId = collectionId;
        this.farmerId = farmerId;
        this.agentId = agentId;
        this.amount = amount;
    }
    getEventName() {
        return 'CollectionCreated';
    }
}
export class CollectionVerifiedEvent extends DomainEvent {
    collectionId;
    verifiedBy;
    constructor(collectionId, verifiedBy) {
        super();
        this.collectionId = collectionId;
        this.verifiedBy = verifiedBy;
    }
    getEventName() {
        return 'CollectionVerified';
    }
}
export class Collection extends Entity {
    storeAgentId;
    farmerId;
    produceTypeId;
    weightKg;
    qualityGrade;
    appliedRate;
    calculatedPayoutAmount;
    status;
    notes;
    collectedAt;
    verifiedAt;
    createdAt;
    updatedAt;
    constructor(id, storeAgentId, farmerId, produceTypeId, weightKg, qualityGrade, appliedRate, calculatedPayoutAmount, collectedAt) {
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
        this.addDomainEvent(new CollectionCreatedEvent(id, farmerId, storeAgentId, calculatedPayoutAmount));
    }
    static create(props) {
        if (props.weightKg <= 0) {
            throw new Error('Weight must be positive');
        }
        if (props.calculatedPayoutAmount.isLessThan(Money.zero())) {
            throw new Error('Payout amount cannot be negative');
        }
        return new Collection(UUIDv7.generate(), props.storeAgentId, props.farmerId, props.produceTypeId, props.weightKg, props.qualityGrade, props.appliedRate, props.calculatedPayoutAmount, props.collectedAt);
    }
    getStoreAgentId() {
        return this.storeAgentId;
    }
    getFarmerId() {
        return this.farmerId;
    }
    getProduceTypeId() {
        return this.produceTypeId;
    }
    getWeightKg() {
        return this.weightKg;
    }
    getQualityGrade() {
        return this.qualityGrade;
    }
    getAppliedRate() {
        return this.appliedRate;
    }
    getCalculatedPayoutAmount() {
        return this.calculatedPayoutAmount;
    }
    getStatus() {
        return this.status;
    }
    getNotes() {
        return this.notes;
    }
    getCollectedAt() {
        return this.collectedAt;
    }
    getVerifiedAt() {
        return this.verifiedAt;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    verify(verifiedBy, notes) {
        if (this.status !== CollectionStatus.PENDING) {
            throw new Error('Only pending collections can be verified');
        }
        this.status = CollectionStatus.VERIFIED;
        this.verifiedAt = new Date();
        this.notes = notes || null;
        this.markAsUpdated();
        this.addDomainEvent(new CollectionVerifiedEvent(this.id, verifiedBy));
    }
    markAsPaid() {
        if (this.status !== CollectionStatus.VERIFIED) {
            throw new Error('Only verified collections can be marked as paid');
        }
        this.status = CollectionStatus.PAID;
        this.markAsUpdated();
    }
    dispute(notes) {
        if (this.status !== CollectionStatus.PENDING &&
            this.status !== CollectionStatus.VERIFIED) {
            throw new Error('Cannot dispute a collection in its current state');
        }
        this.status = CollectionStatus.DISPUTED;
        this.notes = notes;
        this.markAsUpdated();
    }
    cancel(reason) {
        if (this.status === CollectionStatus.PAID) {
            throw new Error('Cannot cancel a paid collection');
        }
        this.status = CollectionStatus.CANCELLED;
        this.notes = reason;
        this.markAsUpdated();
    }
    markAsWasted(reason) {
        this.status = CollectionStatus.WASTED;
        this.notes = reason;
        this.markAsUpdated();
    }
    markAsUpdated() {
        this.updatedAt = new Date();
    }
    isPaid() {
        return this.status === CollectionStatus.PAID;
    }
    isVerified() {
        return (this.status === CollectionStatus.VERIFIED ||
            this.status === CollectionStatus.PAID);
    }
}
//# sourceMappingURL=collection.entity.js.map