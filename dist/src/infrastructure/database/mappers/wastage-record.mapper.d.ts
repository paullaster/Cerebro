import { WastageRecord } from '../../../domain/entities/wastage-record.entity.ts';
export declare class WastageRecordMapper {
    static toDomain(raw: any): WastageRecord;
    static toPersistence(entity: WastageRecord): any;
}
