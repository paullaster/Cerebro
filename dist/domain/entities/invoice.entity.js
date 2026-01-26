import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["PENDING"] = "PENDING";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
})(InvoiceStatus || (InvoiceStatus = {}));
export class Invoice extends Entity {
    collectionId;
    amount;
    status;
    qrCodeUrl;
    createdAt;
    updatedAt;
    constructor(id, collectionId, amount, status, qrCodeUrl, createdAt, updatedAt) {
        super(id);
        this.collectionId = collectionId;
        this.amount = amount;
        this.status = status;
        this.qrCodeUrl = qrCodeUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(props) {
        if (props.amount.isLessThan(Money.zero())) {
            throw new Error('Invoice amount cannot be negative');
        }
        const now = new Date();
        return new Invoice(UUIDv7.generate(), props.collectionId, props.amount, InvoiceStatus.PENDING, null, now, now);
    }
    getCollectionId() {
        return this.collectionId;
    }
    getAmount() {
        return this.amount;
    }
    getStatus() {
        return this.status;
    }
    getQrCodeUrl() {
        return this.qrCodeUrl;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    markAsPaid() {
        this.status = InvoiceStatus.PAID;
        this.updatedAt = new Date();
    }
    setQrCodeUrl(url) {
        this.qrCodeUrl = url;
        this.updatedAt = new Date();
    }
    static reconstitute(props) {
        return new Invoice(props.id, props.collectionId, props.amount, props.status, props.qrCodeUrl, props.createdAt, props.updatedAt);
    }
}
//# sourceMappingURL=invoice.entity.js.map