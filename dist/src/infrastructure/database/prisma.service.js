var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
import { Injectable, Inject, } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../../config/config.service';
import { ILogger } from '../../domain/adapters/logger.service';
import { MetricsService } from '../logging/metrics.service';
let PrismaService = class PrismaService extends PrismaClient {
    configService;
    logger;
    metrics;
    constructor(configService, logger, metrics) {
        super({
            log: configService.isProduction
                ? ['error', 'warn']
                : ['query', 'info', 'error', 'warn'],
            datasources: {
                db: {
                    url: configService.databaseUrl,
                },
            },
            ...(configService.isProduction && {
                ...(configService.databaseReadReplicaUrl && {
                    datasources: {
                        db: {
                            url: configService.databaseUrl,
                        },
                        readOnlyDb: {
                            url: configService.databaseReadReplicaUrl,
                        },
                    },
                }),
            }),
        });
        this.configService = configService;
        this.logger = logger;
        this.metrics = metrics;
        this.setupQueryLogging();
        this.setupConnectionPool();
    }
    setupQueryLogging() {
        this.$on('query', async (event) => {
            const duration = event.duration;
            const query = event.query;
            if (duration > 100) {
                this.logger.warn('Prisma', 'Slow query detected', {
                    duration,
                    query: query.substring(0, 200),
                    params: event.params,
                });
            }
            this.metrics.recordDbQuery(duration);
        });
        this.$on('error', async (event) => {
            this.logger.error('Prisma', 'Database error', new Error(event.message), {
                target: event.target,
            });
        });
    }
    setupConnectionPool() {
        process.env.DATABASE_URL +=
            '?connection_limit=20&pool_timeout=10&connection_limit=20';
        if (this.configService.databaseReadReplicaUrl) {
            process.env.READ_ONLY_DATABASE_URL =
                this.configService.databaseReadReplicaUrl +
                    '?connection_limit=30&pool_timeout=10';
        }
    }
    async onModuleInit() {
        await this.$connect();
        try {
            await this.$queryRaw `SELECT uuid_generate_v7()`;
            this.logger.info('PrismaService', 'UUID v7 extension verified');
        }
        catch (error) {
            this.logger.error('PrismaService', 'UUID v7 extension not available', error);
            throw new Error('UUID v7 extension required');
        }
        const partitions = await this.$queryRaw `
      SELECT COUNT(*) as count FROM partman.part_config 
      WHERE parent_table IN ('collections', 'audit_logs', 'wastage_records')
    `;
        this.logger.info('PrismaService', 'Database partitions verified', {
            partitionedTables: partitions[0]?.count || 0,
        });
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    getReadOnlyClient() {
        if (!this.configService.databaseReadReplicaUrl) {
            return this;
        }
        return new PrismaClient({
            datasources: {
                db: {
                    url: this.configService.databaseReadReplicaUrl,
                },
            },
        });
    }
    async withTransaction(operation, fn, maxRetries = 3) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const start = Date.now();
                const result = await this.$transaction(fn, {
                    maxWait: 5000,
                    timeout: 10000,
                });
                const duration = Date.now() - start;
                this.logger.debug('PrismaService', 'Transaction completed', {
                    operation,
                    duration,
                    retry: i,
                });
                return result;
            }
            catch (error) {
                lastError = error;
                if (error.code === 'P2034' ||
                    error.message.includes('deadlock') ||
                    error.message.includes('serialization')) {
                    this.logger.warn('PrismaService', 'Transaction conflict, retrying', {
                        operation,
                        retry: i + 1,
                        error: error.message,
                    });
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
                    continue;
                }
                break;
            }
        }
        this.logger.error('PrismaService', 'Transaction failed after retries', lastError, {
            operation,
            maxRetries,
        });
        throw lastError;
    }
};
PrismaService = __decorate([
    Injectable(),
    __param(1, Inject('ILogger')),
    __metadata("design:paramtypes", [typeof (_a = typeof ConfigService !== "undefined" && ConfigService) === "function" ? _a : Object, typeof (_b = typeof ILogger !== "undefined" && ILogger) === "function" ? _b : Object, typeof (_c = typeof MetricsService !== "undefined" && MetricsService) === "function" ? _c : Object])
], PrismaService);
export { PrismaService };
//# sourceMappingURL=prisma.service.js.map