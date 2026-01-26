import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../../config/config.service';
import { ILogger } from '../../domain/adapters/logger.service';
import { MetricsService } from '../logging/metrics.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly configService: ConfigService,
    @Inject('ILogger') private readonly logger: ILogger,
    private readonly metrics: MetricsService,
  ) {
    super({
      log: configService.isProduction
        ? ['error', 'warn']
        : ['query', 'info', 'error', 'warn'],
      datasources: {
        db: {
          url: configService.databaseUrl,
        },
      },
      // Connection pooling configuration for 2B transactions
      ...(configService.isProduction && {
        // Read replicas for scaling reads
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

    this.setupQueryLogging();
    this.setupConnectionPool();
  }

  private setupQueryLogging(): void {
    // Query duration monitoring
    this.$on('query' as any, async (event: any) => {
      const duration = event.duration;
      const query = event.query;

      // Log slow queries
      if (duration > 100) {
        // 100ms threshold
        this.logger.warn('Prisma', 'Slow query detected', {
          duration,
          query: query.substring(0, 200), // Truncate for logs
          params: event.params,
        });
      }

      // Record metrics
      this.metrics.recordDbQuery(duration);
    });

    // Error logging
    this.$on('error' as any, async (event: any) => {
      this.logger.error('Prisma', 'Database error', new Error(event.message), {
        target: event.target,
      });
    });
  }

  private setupConnectionPool(): void {
    // Configure connection pool for high throughput
    // Prisma uses PgBouncer-compatible settings
    process.env.DATABASE_URL +=
      '?connection_limit=20&pool_timeout=10&connection_limit=20';

    if (this.configService.databaseReadReplicaUrl) {
      process.env.READ_ONLY_DATABASE_URL =
        this.configService.databaseReadReplicaUrl +
        '?connection_limit=30&pool_timeout=10'; // More connections for reads
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    // Verify UUID v7 extension
    try {
      await this.$queryRaw`SELECT uuid_generate_v7()`;
      this.logger.info('PrismaService', 'UUID v7 extension verified');
    } catch (error) {
      this.logger.error(
        'PrismaService',
        'UUID v7 extension not available',
        error,
      );
      throw new Error('UUID v7 extension required');
    }

    // Verify partitions
    const partitions = await this.$queryRaw<Array<any>>`
      SELECT COUNT(*) as count FROM partman.part_config 
      WHERE parent_table IN ('collections', 'audit_logs', 'wastage_records')
    `;

    this.logger.info('PrismaService', 'Database partitions verified', {
      partitionedTables: partitions[0]?.count || 0,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  // Helper for read replica
  getReadOnlyClient(): PrismaClient {
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

  // Transaction helper with retry logic
  async withTransaction<T>(
    operation: string,
    fn: (tx: any) => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error;

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
      } catch (error) {
        lastError = error;

        // Retry on serialization/deadlock errors
        if (
          error.code === 'P2034' || // Transaction failed
          error.message.includes('deadlock') ||
          error.message.includes('serialization')
        ) {
          this.logger.warn('PrismaService', 'Transaction conflict, retrying', {
            operation,
            retry: i + 1,
            error: error.message,
          });

          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 100),
          );
          continue;
        }

        // Non-retryable error
        break;
      }
    }

    this.logger.error(
      'PrismaService',
      'Transaction failed after retries',
      lastError,
      {
        operation,
        maxRetries,
      },
    );

    throw lastError;
  }
}
