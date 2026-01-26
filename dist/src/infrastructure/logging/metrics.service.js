var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';
let MetricsService = class MetricsService {
    collectionCounter;
    collectionDuration;
    activeCollections;
    dbQueryDuration;
    dbConnections;
    cacheHitCounter;
    cacheMissCounter;
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
    incrementCollection(status, grade) {
        this.collectionCounter.inc({ status, grade });
    }
    startCollectionTimer(type) {
        const end = this.collectionDuration.startTimer({ type });
        return end;
    }
    setActiveCollections(status, count) {
        this.activeCollections.set({ status }, count);
    }
    async recordDbQuery(operation, table, query) {
        const end = this.dbQueryDuration.startTimer({ operation, table });
        try {
            return await query();
        }
        finally {
            end();
        }
    }
    recordCacheHit(type) {
        this.cacheHitCounter.inc({ type });
    }
    recordCacheMiss(type) {
        this.cacheMissCounter.inc({ type });
    }
    async getMetrics() {
        return await register.metrics();
    }
};
MetricsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], MetricsService);
export { MetricsService };
//# sourceMappingURL=metrics.service.js.map