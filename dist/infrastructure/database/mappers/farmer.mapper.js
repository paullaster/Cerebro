import { Farmer, } from '../../../domain/entities/farmer.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { BadRequestException } from '@nestjs/common';
export class FarmerMapper {
    static toDomain(raw) {
        if (!raw)
            throw new BadRequestException('Farmer is required!');
        const farmer = raw;
        return Farmer.reconstitute({
            id: new UUIDv7(farmer.user_id),
            userId: new UUIDv7(farmer.user_id),
            farmName: farmer.farm_name,
            locationPlaceId: farmer.location_place_id,
            locationLat: farmer.location_lat,
            locationLng: farmer.location_lng,
            cropSpecialties: farmer.crop_specialties || [],
            preferredPaymentMethod: farmer.preferred_payment_method,
            totalCollectedAmount: Money.zero(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    static toPersistence(farmer) {
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
//# sourceMappingURL=farmer.mapper.js.map