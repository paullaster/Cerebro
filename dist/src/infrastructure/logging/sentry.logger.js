var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { LogLevel, } from '../../domain/adapters/logger.service';
import { ConfigService } from '../../config/config.service';
let SentryLogger = class SentryLogger {
    configService;
    constructor(configService) {
        this.configService = configService;
        if (this.configService.sentryDsn) {
            Sentry.init({
                dsn: this.configService.sentryDsn,
                environment: this.configService.nodeEnv,
                tracesSampleRate: 1.0,
                profilesSampleRate: 1.0,
            });
        }
    }
    setLevel(level) {
    }
    debug(context, message, meta) {
    }
    info(context, message, meta) {
        this.logToSentry(LogLevel.INFO, context, message, undefined, meta);
    }
    warn(context, message, meta) {
        this.logToSentry(LogLevel.WARN, context, message, undefined, meta);
    }
    error(context, message, error, meta) {
        this.logToSentry(LogLevel.ERROR, context, message, error, meta);
    }
    fatal(context, message, error, meta) {
        this.logToSentry(LogLevel.FATAL, context, message, error, meta);
    }
    log(entry) {
        this.logToSentry(entry.level, entry.context, entry.message, entry.error ? new Error(entry.error.message) : undefined, entry.meta);
    }
    async time(context, operation, fn) {
        return await Sentry.startSpan({
            name: operation,
            op: context,
        }, async () => {
            return await fn();
        });
    }
    performance(context, duration, threshold, meta) {
        if (duration > threshold) {
            this.warn('Performance', `Threshold exceeded in ${context}`, {
                duration,
                threshold,
                ...meta,
            });
        }
    }
    audit(actor, action, resource, resourceId, changes) {
        Sentry.addBreadcrumb({
            category: 'audit',
            message: `${actor} ${action} ${resource}`,
            data: { resourceId, ...changes },
            level: 'info',
        });
    }
    httpRequest(method, url, status, duration, userId, meta) {
        if (status >= 500) {
            this.error('HTTP', `${method} ${url} failed with ${status}`, undefined, {
                method,
                url,
                status,
                duration,
                userId,
                ...meta,
            });
        }
    }
    async flush() {
        await Sentry.flush(2000);
    }
    logToSentry(level, context, message, error, meta) {
        if (!this.configService.sentryDsn)
            return;
        Sentry.withScope((scope) => {
            scope.setTag('context', context);
            if (meta) {
                scope.setExtras(meta);
            }
            const sentryLevel = this.mapLevel(level);
            if (error || level >= LogLevel.ERROR) {
                Sentry.captureException(error || new Error(message), {
                    level: sentryLevel,
                    extra: { context, originalMessage: message, ...meta },
                });
            }
            else {
                Sentry.captureMessage(message, sentryLevel);
            }
        });
    }
    mapLevel(level) {
        switch (level) {
            case LogLevel.DEBUG:
                return 'debug';
            case LogLevel.INFO:
                return 'info';
            case LogLevel.WARN:
                return 'warning';
            case LogLevel.ERROR:
                return 'error';
            case LogLevel.FATAL:
                return 'fatal';
            default:
                return 'info';
        }
    }
};
SentryLogger = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof ConfigService !== "undefined" && ConfigService) === "function" ? _a : Object])
], SentryLogger);
export { SentryLogger };
//# sourceMappingURL=sentry.logger.js.map