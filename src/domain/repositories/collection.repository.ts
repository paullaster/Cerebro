import { Collection, CollectionStatus, CollectionGrade } from '../entities/collection.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object';
import { Money } from '../value-objects/money.value-object';

export interface DateRange {
    start: Date;
    end: Date;
}

export interface ICollectionRepository {
    // Find operations
    findById(id: UUIDv7): Promise<Collection | null>;
    findByFarmerId(farmerId: UUIDv7, options?: {
        status?: CollectionStatus;
        dateRange?: DateRange;
        page?: number;
        limit?: number;
    }): Promise<{ collections: Collection[]; total: number }>;

    findByAgentId(agentId: UUIDv7, options?: {
        status?: CollectionStatus;
        dateRange?: DateRange;
        page?: number;
        limit?: number;
    }): Promise<{ collections: Collection[]; total: number }>;

    findByProduceType(produceTypeId: UUIDv7, options?: {
        status?: CollectionStatus;
        dateRange?: DateRange;
        page?: number;
        limit?: number;
    }): Promise<{ collections: Collection[]; total: number }>;

    // List operations
    listPending(agentId?: UUIDv7): Promise<Collection[]>;
    listRecent(count: number): Promise<Collection[]>;

    // Save operations
    save(collection: Collection): Promise<Collection>;
    update(collection: Collection): Promise<Collection>;

    // Aggregate operations
    getDailySummary(date: Date): Promise<{
        totalWeight: number;
        totalAmount: Money;
        count: number;
        byGrade: Record<CollectionGrade, { count: number; weight: number; amount: Money }>;
    }>;

    getMonthlySummary(year: number, month: number): Promise<{
        totalWeight: number;
        totalAmount: Money;
        count: number;
        dailyBreakdown: Array<{ date: string; weight: number; amount: Money; count: number }>;
    }>;

    // Count operations
    countByStatus(status: CollectionStatus, dateRange?: DateRange): Promise<number>;
    countByFarmer(farmerId: UUIDv7, dateRange?: DateRange): Promise<number>;
    countByAgent(agentId: UUIDv7, dateRange?: DateRange): Promise<number>;

    // Analytics operations
    getTopFarmers(limit: number, dateRange?: DateRange): Promise<
        Array<{ farmerId: UUIDv7; totalAmount: Money; count: number }>
    >;

    getTopAgents(limit: number, dateRange?: DateRange): Promise<
        Array<{ agentId: UUIDv7; totalAmount: Money; count: number }>
    >;

    // Partition management
    getPartitionInfo(): Promise<Array<{
        partitionName: string;
        tableSpace: string;
        rowCount: number;
        size: string;
    }>>;

    // Batch operations
    bulkInsert(collections: Collection[]): Promise<void>;
    bulkUpdateStatus(ids: UUIDv7[], status: CollectionStatus): Promise<void>;
}