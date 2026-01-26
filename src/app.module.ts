import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from './config/config.module.js';
import { LoggerModule } from './infrastructure/logging/logger.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { RedisModule } from './infrastructure/cache/redis.module.js';
import { AuthModule } from './infrastructure/security/auth.module.js';
import { CollectionModule } from './presentation/http/modules/collection.module.js';
import { FinancialModule } from './presentation/http/modules/financial.module.js';
import { AnalyticsModule } from './presentation/http/modules/analytics.module.js';
import { WebSocketModule } from './presentation/websocket/websocket.module.js';
import { WorkerModule } from './presentation/workers/worker.module.js';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    LoggerModule.forRoot(),
    DatabaseModule,
    RedisModule,

    // Feature modules
    AuthModule,
    CollectionModule,
    FinancialModule,
    AnalyticsModule,

    // Real-time modules
    WebSocketModule,

    // Background workers
    WorkerModule,

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // 1 minute default
      max: 10000, // Maximum items in cache
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
