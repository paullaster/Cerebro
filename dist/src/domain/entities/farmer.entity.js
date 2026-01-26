import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';
import { BadRequestException } from '@nestjs/common';
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["MPESA"] = "MPESA";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CASH"] = "CASH";
})(PaymentMethod || (PaymentMethod = {}));
export class Farmer extends Entity {
    userId;
    farmName;
    locationPlaceId;
    locationLat;
    locationLng;
    cropSpecialties;
    preferredPaymentMethod;
    totalCollectedAmount;
    createdAt;
    updatedAt;
    constructor(id, userId, farmName, locationPlaceId, locationLat, locationLng, cropSpecialties, preferredPaymentMethod) {
        super(id);
        this.userId = userId;
        this.farmName = farmName;
        this.locationPlaceId = locationPlaceId;
        this.locationLat = locationLat;
        this.locationLng = locationLng;
        this.cropSpecialties = cropSpecialties;
        this.preferredPaymentMethod = preferredPaymentMethod;
        this.totalCollectedAmount = Money.zero();
        const now = new Date();
        this.createdAt = now;
        this.updatedAt = now;
    }
    static create(props) {
        return new Farmer(UUIDv7.generate(), props.userId, props.farmName, props.locationPlaceId, props.locationLat, props.locationLng, props.cropSpecialties, props.preferredPaymentMethod);
    }
    getUserId() {
        return this.userId;
    }
    getFarmName() {
        return this.farmName;
    }
    getLocationPlaceId() {
        return this.locationPlaceId;
    }
    getLocationLat() {
        return this.locationLat;
    }
    getLocationLng() {
        return this.locationLng;
    }
    getCropSpecialties() {
        return [...this.cropSpecialties];
    }
    getPreferredPaymentMethod() {
        return this.preferredPaymentMethod;
    }
    getTotalCollectedAmount() {
        return this.totalCollectedAmount;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    updateLocation(placeId, lat, lng) {
        if (lat < -90 || lat > 90) {
            throw new BadRequestException('Invalid latitude');
        }
        if (lng < -180 || lng > 180) {
            throw new BadRequestException('Invalid longitude');
        }
        this.locationPlaceId = placeId;
        this.locationLat = lat;
        this.locationLng = lng;
        this.markAsUpdated();
    }
    addCropSpecialty(crop) {
        if (!this.cropSpecialties.includes(crop)) {
            this.cropSpecialties.push(crop);
            this.markAsUpdated();
        }
    }
    removeCropSpecialty(crop) {
        this.cropSpecialties = this.cropSpecialties.filter((c) => c !== crop);
        this.markAsUpdated();
    }
    updatePaymentMethod(method) {
        this.preferredPaymentMethod = method;
        this.markAsUpdated();
    }
    addCollectionAmount(amount) {
        this.totalCollectedAmount = this.totalCollectedAmount.add(amount);
        this.markAsUpdated();
    }
    markAsUpdated() {
        this.updatedAt = new Date();
    }
    static reconstitute(props) {
        const farmer = new Farmer(props.id, props.userId, props.farmName, props.locationPlaceId, props.locationLat, props.locationLng, props.cropSpecialties, props.preferredPaymentMethod);
        farmer.totalCollectedAmount = props.totalCollectedAmount;
        farmer.createdAt = props.createdAt;
        farmer.updatedAt = props.updatedAt;
        return farmer;
    }
}
//# sourceMappingURL=farmer.entity.js.map