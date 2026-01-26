var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule,
            LoggerModule.forRoot(),
            DatabaseModule,
            RedisModule,
            AuthModule,
            CollectionModule,
            FinancialModule,
            AnalyticsModule,
            WebSocketModule,
            WorkerModule,
            ScheduleModule.forRoot(),
            CacheModule.register({
                isGlobal: true,
                ttl: 60,
                max: 10000,
            }),
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map