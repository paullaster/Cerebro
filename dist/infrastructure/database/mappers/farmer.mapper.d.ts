import { Farmer } from '../../../domain/entities/farmer.entity.ts';
export declare class FarmerMapper {
    static toDomain(raw: unknown): Farmer;
    static toPersistence(farmer: Farmer): any;
}
