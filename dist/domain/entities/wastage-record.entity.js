import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export var WastageReason;
(function (WastageReason) {
    WastageReason["SPOILAGE"] = "SPOILAGE";
    WastageReason["THEFT"] = "THEFT";
    WastageReason["QUALITY_REJECTION"] = "QUALITY_REJECTION";
})(WastageReason || (WastageReason = {}));
export class WastageRecord extends Entity {
    collectionId;
    agentId;
    produceTypeId;
    weightKg;
    reason;
    declaredAt;
    createdAt;
    updatedAt;
    constructor(id, collectionId, agentId, produceTypeId, weightKg, reason, declaredAt) {
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
    static create(props) {
        if (props.weightKg <= 0) {
            throw new Error('Weight must be positive');
        }
        return new WastageRecord(UUIDv7.generate(), props.collectionId || null, props.agentId, props.produceTypeId, props.weightKg, props.reason, props.declaredAt || new Date());
    }
    getCollectionId() {
        return this.collectionId;
    }
    getAgentId() {
        return this.agentId;
    }
    getProduceTypeId() {
        return this.produceTypeId;
    }
    getWeightKg() {
        return this.weightKg;
    }
    getReason() {
        return this.reason;
    }
    getDeclaredAt() {
        return this.declaredAt;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    static reconstitute(props) {
        const entity = new WastageRecord(props.id, props.collectionId, props.agentId, props.produceTypeId, props.weightKg, props.reason, props.declaredAt);
        entity.createdAt = props.createdAt;
        entity.updatedAt = props.updatedAt;
        return entity;
    }
}
//# sourceMappingURL=wastage-record.entity.js.map