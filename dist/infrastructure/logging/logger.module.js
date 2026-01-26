var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggerModule_1;
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '../../config/config.service.ts';
import { ConsoleLogger } from './console.logger.ts';
import { SentryLogger } from './sentry.logger.ts';
import { CompositeLogger } from './composite.logger.ts';
let LoggerModule = LoggerModule_1 = class LoggerModule {
    static forRoot() {
        const loggerProvider = {
            provide: 'ILogger',
            useFactory: (configService) => {
                const consoleLogger = new ConsoleLogger();
                const sentryLogger = new SentryLogger(configService);
                return new CompositeLogger([consoleLogger, sentryLogger]);
            },
            inject: [ConfigService],
        };
        return {
            module: LoggerModule_1,
            providers: [loggerProvider],
            exports: ['ILogger'],
        };
    }
};
LoggerModule = LoggerModule_1 = __decorate([
    Global(),
    Module({})
], LoggerModule);
export { LoggerModule };
//# sourceMappingURL=logger.module.js.map