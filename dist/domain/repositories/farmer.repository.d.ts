import { Farmer } from '../entities/farmer.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export interface IFarmerRepository {
    save(farmer: Farmer): Promise<Farmer>;
    findById(userId: UUIDv7): Promise<Farmer | null>;
}
