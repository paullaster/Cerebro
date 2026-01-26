import {
  Farmer,
  PaymentMethod,
} from '../../../domain/entities/farmer.entity.ts';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.value-object.ts';
import { Money } from '../../../domain/value-objects/money.value-object.ts';
import { BadRequestException } from '@nestjs/common';

interface RawFarmerRecord {
  user_id: string;
  farm_name: string;
  location_place_id: string;
  location_lat: number;
  location_lng: number;
  crop_specialties: string[];
  preferred_payment_method: PaymentMethod;
}

export class FarmerMapper {
  static toDomain(raw: unknown): Farmer {
    if (!raw) throw new BadRequestException('Farmer is required!');

    const farmer = raw as RawFarmerRecord;
    return Farmer.reconstitute({
      id: new UUIDv7(farmer.user_id),
      userId: new UUIDv7(farmer.user_id),
      farmName: farmer.farm_name,
      locationPlaceId: farmer.location_place_id,
      locationLat: farmer.location_lat,
      locationLng: farmer.location_lng,
      cropSpecialties: farmer.crop_specialties || [],
      preferredPaymentMethod: farmer.preferred_payment_method,
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
