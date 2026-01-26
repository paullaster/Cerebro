import { Collection } from '../../../domain/entities/collection.entity.ts';
export declare class CollectionMapper {
    static toDomain(raw: any): Collection;
    static toPersistence(collection: Collection): any;
}
