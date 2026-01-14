import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { ILogger } from '../../domain/adapters/logger.service';
import { StructuredLogger } from './structured.logger';
import { LokiLogger } from './loki.logger';
import { ConsoleLogger } from './console.logger';

@Global()
@Module({})
export class LoggerModule {
    static forRoot(): DynamicModule {
        const loggerProvider: Provider = {
            provide: 'ILogger',
            useFactory: (configService: ConfigService): ILogger => {
                const env = configService.isProduction ? 'production' : 'development';
                const logLevel = configService.logLevel || 'info';

                // Use Loki in production, structured JSON in development
                if (configService.lokiEnabled && env === 'production') {
                    return new LokiLogger(configService);
                }

                // Use structured JSON logger for development/staging
                return new StructuredLogger(logLevel, env);
            },
            inject: [ConfigService],
        };

        return {
            module: LoggerModule,
            providers: [loggerProvider],
            exports: ['ILogger'],
        };
    }
}