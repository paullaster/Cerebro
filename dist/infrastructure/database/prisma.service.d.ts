import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../../config/config.service';
import { ILogger } from '../../domain/adapters/logger.service';
import { MetricsService } from '../logging/metrics.service';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly metrics;
    constructor(configService: ConfigService, logger: ILogger, metrics: MetricsService);
    private setupQueryLogging;
    private setupConnectionPool;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getReadOnlyClient(): PrismaClient;
    withTransaction<T>(operation: string, fn: (tx: any) => Promise<T>, maxRetries?: number): Promise<T>;
}
