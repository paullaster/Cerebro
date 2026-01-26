import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';
export declare enum PaymentMethod {
    MPESA = "MPESA",
    BANK_TRANSFER = "BANK_TRANSFER",
    CASH = "CASH"
}
export declare class Farmer extends Entity<UUIDv7> {
    private userId;
    private farmName;
    private locationPlaceId;
    private locationLat;
    private locationLng;
    private cropSpecialties;
    private preferredPaymentMethod;
    private totalCollectedAmount;
    private createdAt;
    private updatedAt;
    private constructor();
    static create(props: {
        userId: UUIDv7;
        farmName: string;
        locationPlaceId: string;
        locationLat: number;
        locationLng: number;
        cropSpecialties: string[];
        preferredPaymentMethod: PaymentMethod;
    }): Farmer;
    getUserId(): UUIDv7;
    getFarmName(): string;
    getLocationPlaceId(): string;
    getLocationLat(): number;
    getLocationLng(): number;
    getCropSpecialties(): string[];
    getPreferredPaymentMethod(): PaymentMethod;
    getTotalCollectedAmount(): Money;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    updateLocation(placeId: string, lat: number, lng: number): void;
    addCropSpecialty(crop: string): void;
    removeCropSpecialty(crop: string): void;
    updatePaymentMethod(method: PaymentMethod): void;
    addCollectionAmount(amount: Money): void;
    private markAsUpdated;
    static reconstitute(props: {
        id: UUIDv7;
        userId: UUIDv7;
        farmName: string;
        locationPlaceId: string;
        locationLat: number;
        locationLng: number;
        cropSpecialties: string[];
        preferredPaymentMethod: PaymentMethod;
        totalCollectedAmount: Money;
        createdAt: Date;
        updatedAt: Date;
    }): Farmer;
}
