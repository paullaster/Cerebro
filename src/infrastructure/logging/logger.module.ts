import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '../../config/config.service.ts';
import { ILogger } from '../../domain/adapters/logger.service.ts';
import { ConsoleLogger } from './console.logger.ts';
import { SentryLogger } from './sentry.logger.ts';
import { CompositeLogger } from './composite.logger.ts';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    const loggerProvider: Provider = {
      provide: 'ILogger',
      useFactory: (configService: ConfigService): ILogger => {
        const consoleLogger = new ConsoleLogger();
        const sentryLogger = new SentryLogger(configService);
        return new CompositeLogger([consoleLogger, sentryLogger]);
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
