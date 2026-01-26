export declare class MetricsService {
    private readonly collectionCounter;
    private readonly collectionDuration;
    private readonly activeCollections;
    private readonly dbQueryDuration;
    private readonly dbConnections;
    private readonly cacheHitCounter;
    private readonly cacheMissCounter;
    constructor();
    incrementCollection(status: string, grade: string): void;
    startCollectionTimer(type: string): () => void;
    setActiveCollections(status: string, count: number): void;
    recordDbQuery<T>(operation: string, table: string, query: () => Promise<T>): Promise<T>;
    recordCacheHit(type: string): void;
    recordCacheMiss(type: string): void;
    getMetrics(): Promise<string>;
}
