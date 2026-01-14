import { Entity } from './base.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object';
import { Money } from '../value-objects/money.value-object';

export enum PaymentMethod {
    MPESA = 'MPESA',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
}

export class Farmer extends Entity<UUIDv7> {
    private userId: UUIDv7;
    private farmName: string;
    private locationPlaceId: string;
    private locationLat: number;
    private locationLng: number;
    private cropSpecialties: string[];
    private preferredPaymentMethod: PaymentMethod;
    private totalCollectedAmount: Money;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: UUIDv7,
        userId: UUIDv7,
        farmName: string,
        locationPlaceId: string,
        locationLat: number,
        locationLng: number,
        cropSpecialties: string[],
        preferredPaymentMethod: PaymentMethod,
    ) {
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

    static create(props: {
        userId: UUIDv7;
        farmName: string;
        locationPlaceId: string;
        locationLat: number;
        locationLng: number;
        cropSpecialties: string[];
        preferredPaymentMethod: PaymentMethod;
    }): Farmer {
        return new Farmer(
            UUIDv7.generate(),
            props.userId,
            props.farmName,
            props.locationPlaceId,
            props.locationLat,
            props.locationLng,
            props.cropSpecialties,
            props.preferredPaymentMethod,
        );
    }

    // Getters
    getUserId(): UUIDv7 { return this.userId; }
    getFarmName(): string { return this.farmName; }
    getLocationPlaceId(): string { return this.locationPlaceId; }
    getLocationLat(): number { return this.locationLat; }
    getLocationLng(): number { return this.locationLng; }
    getCropSpecialties(): string[] { return [...this.cropSpecialties]; }
    getPreferredPaymentMethod(): PaymentMethod { return this.preferredPaymentMethod; }
    getTotalCollectedAmount(): Money { return this.totalCollectedAmount; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }

    // Business methods
    updateLocation(
        placeId: string,
        lat: number,
        lng: number,
    ): void {
        if (lat < -90 || lat > 90) {
            throw new Error('Invalid latitude');
        }
        if (lng < -180 || lng > 180) {
            throw new Error('Invalid longitude');
        }

        this.locationPlaceId = placeId;
        this.locationLat = lat;
        this.locationLng = lng;
        this.markAsUpdated();
    }

    addCropSpecialty(crop: string): void {
        if (!this.cropSpecialties.includes(crop)) {
            this.cropSpecialties.push(crop);
            this.markAsUpdated();
        }
    }

    removeCropSpecialty(crop: string): void {
        this.cropSpecialties = this.cropSpecialties.filter(c => c !== crop);
        this.markAsUpdated();
    }

    updatePaymentMethod(method: PaymentMethod): void {
        this.preferredPaymentMethod = method;
        this.markAsUpdated();
    }

    addCollectionAmount(amount: Money): void {
        this.totalCollectedAmount = this.totalCollectedAmount.add(amount);
        this.markAsUpdated();
    }

    private markAsUpdated(): void {
        this.updatedAt = new Date();
    }
}