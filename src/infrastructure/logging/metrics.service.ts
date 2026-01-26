import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';

@Injectable()
export class MetricsService {
  // Collection metrics
  private readonly collectionCounter: Counter<string>;
  private readonly collectionDuration: Histogram<string>;
  private readonly activeCollections: Gauge<string>;

  // Database metrics
  private readonly dbQueryDuration: Histogram<string>;
  private readonly dbConnections: Gauge<string>;

  // Cache metrics
  private readonly cacheHitCounter: Counter<string>;
  private readonly cacheMissCounter: Counter<string>;

  constructor() {
    this.collectionCounter = new Counter({
      name: 'agricollect_collections_total',
      help: 'Total number of collections',
      labelNames: ['status', 'grade'],
    });

    this.collectionDuration = new Histogram({
      name: 'agricollect_collection_duration_seconds',
      help: 'Duration of collection processing',
      labelNames: ['type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });

    this.activeCollections = new Gauge({
      name: 'agricollect_active_collections',
      help: 'Number of active collections',
      labelNames: ['status'],
    });

    this.dbQueryDuration = new Histogram({
      name: 'agricollect_db_query_duration_seconds',
      help: 'Duration of database queries',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
    });

    this.dbConnections = new Gauge({
      name: 'agricollect_db_connections',
      help: 'Number of database connections',
      labelNames: ['state'],
    });

    this.cacheHitCounter = new Counter({
      name: 'agricollect_cache_hits_total',
      help: 'Total cache hits',
      labelNames: ['type'],
    });

    this.cacheMissCounter = new Counter({
      name: 'agricollect_cache_misses_total',
      help: 'Total cache misses',
      labelNames: ['type'],
    });
  }

  incrementCollection(status: string, grade: string): void {
    this.collectionCounter.inc({ status, grade });
  }

  startCollectionTimer(type: string): () => void {
    const end = this.collectionDuration.startTimer({ type });
    return end;
  }

  setActiveCollections(status: string, count: number): void {
    this.activeCollections.set({ status }, count);
  }

  async recordDbQuery<T>(
    operation: string,
    table: string,
    query: () => Promise<T>,
  ): Promise<T> {
    const end = this.dbQueryDuration.startTimer({ operation, table });
    try {
      return await query();
    } finally {
      end();
    }
  }

  recordCacheHit(type: string): void {
    this.cacheHitCounter.inc({ type });
  }

  recordCacheMiss(type: string): void {
    this.cacheMissCounter.inc({ type });
  }

  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
