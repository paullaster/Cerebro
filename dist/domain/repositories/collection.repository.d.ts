import { Collection, CollectionStatus, CollectionGrade } from '../entities/collection.entity.ts';
import { Invoice } from '../entities/invoice.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
import { Money } from '../value-objects/money.value-object.ts';
export interface DateRange {
    start: Date;
    end: Date;
}
export interface ICollectionRepository {
    save(collection: Collection): Promise<Collection>;
    saveWithInvoice(collection: Collection, invoice: Invoice): Promise<void>;
    findById(id: UUIDv7): Promise<Collection | null>;
    findByFarmerId(farmerId: UUIDv7, options?: {
        status?: CollectionStatus;
        dateRange?: DateRange;
        page?: number;
        limit?: number;
    }): Promise<{
        collections: Collection[];
        total: number;
    }>;
    findByAgentId(agentId: UUIDv7, options?: {
        status?: CollectionStatus;
        dateRange?: DateRange;
        page?: number;
        limit?: number;
    }): Promise<{
        collections: Collection[];
        total: number;
    }>;
    findByProduceType(produceTypeId: UUIDv7, options?: {
        status?: CollectionStatus;
        dateRange?: DateRange;
        page?: number;
        limit?: number;
    }): Promise<{
        collections: Collection[];
        total: number;
    }>;
    listPending(agentId?: UUIDv7): Promise<Collection[]>;
    listRecent(count: number): Promise<Collection[]>;
    save(collection: Collection): Promise<Collection>;
    update(collection: Collection): Promise<Collection>;
    getDailySummary(date: Date): Promise<{
        totalWeight: number;
        totalAmount: Money;
        count: number;
        byGrade: Record<CollectionGrade, {
            count: number;
            weight: number;
            amount: Money;
        }>;
    }>;
    getMonthlySummary(year: number, month: number): Promise<{
        totalWeight: number;
        totalAmount: Money;
        count: number;
        dailyBreakdown: Array<{
            date: string;
            weight: number;
            amount: Money;
            count: number;
        }>;
    }>;
    countByStatus(status: CollectionStatus, dateRange?: DateRange): Promise<number>;
    countByFarmer(farmerId: UUIDv7, dateRange?: DateRange): Promise<number>;
    countByAgent(agentId: UUIDv7, dateRange?: DateRange): Promise<number>;
    getTopFarmers(limit: number, dateRange?: DateRange): Promise<Array<{
        farmerId: UUIDv7;
        totalAmount: Money;
        count: number;
    }>>;
    getTopAgents(limit: number, dateRange?: DateRange): Promise<Array<{
        agentId: UUIDv7;
        totalAmount: Money;
        count: number;
    }>>;
    getPartitionInfo(): Promise<Array<{
        partitionName: string;
        tableSpace: string;
        rowCount: number;
        size: string;
    }>>;
    bulkInsert(collections: Collection[]): Promise<void>;
    bulkUpdateStatus(ids: UUIDv7[], status: CollectionStatus): Promise<void>;
}
