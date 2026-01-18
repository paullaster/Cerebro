import { Farmer, PaymentMethod } from '../../../domain/entities/farmer.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';

export class FarmerMapper {
    static toDomain(raw: any): Farmer {
        if (!raw) return null;

        return Farmer.reconstitute({
            id: new UUIDv7(raw.user_id), // Farmer ID is same as User ID in DB (1:1), but entity treats them separate? 
            // In schema: Farmer id is user_id.
            // In Entity: Farmer has own ID and userId.
            // Let's align: In 1:1, usually PK of Farmer is FK to User.
            // Entity code: constructor(id: UUIDv7, userId: UUIDv7, ...)
            // Schema: model Farmer { user_id String @id ... }
            // So id and userId are essentially the same.

            id: new UUIDv7(raw.user_id),
            userId: new UUIDv7(raw.user_id),
            farmName: raw.farm_name,
            locationPlaceId: raw.location_place_id,
            locationLat: raw.location_lat,
            locationLng: raw.location_lng,
            cropSpecialties: raw.crop_specialties || [],
            preferredPaymentMethod: raw.preferred_payment_method as PaymentMethod,
            totalCollectedAmount: Money.zero(), // Not stored in Farmer table? Need to aggregate or store?
            // PRD doesn't explicitly say "Farmer.totalEarnings" in table.
            // Let's assume 0 for now or fetch from collections if needed (but that's expensive for mapper).
            // For now, Money.zero().
            createdAt: new Date(), // Not in Farmer table, maybe join User? Or Farmer table created_at? 
            // Schema doesn't have created_at on Farmer.
            updatedAt: new Date(),
        });
    }

    static toPersistence(farmer: Farmer): any {
        return {
            user_id: farmer.getUserId().toString(),
            farm_name: farmer.getFarmName(),
            location_place_id: farmer.getLocationPlaceId(),
            location_lat: farmer.getLocationLat(),
            location_lng: farmer.getLocationLng(),
            crop_specialties: farmer.getCropSpecialties(),
            preferred_payment_method: farmer.getPreferredPaymentMethod(),
        };
    }
}