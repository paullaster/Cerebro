import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/cache/redis.module';
import { AuthModule } from './infrastructure/security/auth.module';
import { CollectionModule } from './presentation/http/modules/collection.module';
import { FinancialModule } from './presentation/http/modules/financial.module';
import { AnalyticsModule } from './presentation/http/modules/analytics.module';
import { WebSocketModule } from './presentation/websocket/websocket.module';
import { WorkerModule } from './presentation/workers/worker.module';
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
export class AppModule { }