import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ILogger, LogLevel, LogEntry } from '../../domain/adapters/logger.service.ts';
import { ConfigService } from '../../config/config.service.ts';

@Injectable()
export class SentryLogger implements ILogger {
    constructor(private readonly configService: ConfigService) {
        if (this.configService.sentryDsn) {
            Sentry.init({
                dsn: this.configService.sentryDsn,
                environment: this.configService.nodeEnv,
                tracesSampleRate: 1.0,
                profilesSampleRate: 1.0,
            });
        }
    }

    setLevel(level: LogLevel): void {
        // Sentry filtering is usually done via DSN/Env or during capture
    }

    debug(context: string, message: string, meta?: Record<string, any>): void {
        // Skip debug in Sentry to save quota unless critical
    }

    info(context: string, message: string, meta?: Record<string, any>): void {
        this.logToSentry(LogLevel.INFO, context, message, undefined, meta);
    }

    warn(context: string, message: string, meta?: Record<string, any>): void {
        this.logToSentry(LogLevel.WARN, context, message, undefined, meta);
    }

    error(context: string, message: string, error?: Error, meta?: Record<string, any>): void {
        this.logToSentry(LogLevel.ERROR, context, message, error, meta);
    }

    fatal(context: string, message: string, error?: Error, meta?: Record<string, any>): void {
        this.logToSentry(LogLevel.FATAL, context, message, error, meta);
    }

    log(entry: LogEntry): void {
        this.logToSentry(
            entry.level,
            entry.context,
            entry.message,
            entry.error ? new Error(entry.error.message) : undefined,
            entry.meta
        );
    }

    async time<T>(context: string, operation: string, fn: () => Promise<T>): Promise<T> {
        return await Sentry.startSpan({
            name: operation,
            op: context,
        }, async () => {
            return await fn();
        });
    }

    performance(context: string, duration: number, threshold: number, meta?: Record<string, any>): void {
        if (duration > threshold) {
            this.warn('Performance', `Threshold exceeded in ${context}`, { duration, threshold, ...meta });
        }
    }

    audit(actor: string, action: string, resource: string, resourceId: string, changes?: Record<string, any>): void {
        Sentry.addBreadcrumb({
            category: 'audit',
            message: `${actor} ${action} ${resource}`,
            data: { resourceId, ...changes },
            level: 'info',
        });
    }

    httpRequest(method: string, url: string, status: number, duration: number, userId?: string, meta?: Record<string, any>): void {
        if (status >= 500) {
            this.error('HTTP', `${method} ${url} failed with ${status}`, undefined, {
                method,
                url,
                status,
                duration,
                userId,
                ...meta
            });
        }
    }

    async flush(): Promise<void> {
        await Sentry.flush(2000);
    }

    private logToSentry(level: LogLevel, context: string, message: string, error?: Error, meta?: Record<string, any>): void {
        if (!this.configService.sentryDsn) return;

        Sentry.withScope((scope) => {
            scope.setTag('context', context);
            if (meta) {
                scope.setExtras(meta);
            }

            const sentryLevel = this.mapLevel(level);

            if (error || level >= LogLevel.ERROR) {
                Sentry.captureException(error || new Error(message), {
                    level: sentryLevel as Sentry.SeverityLevel,
                    extra: { context, originalMessage: message, ...meta }
                });
            } else {
                Sentry.captureMessage(message, sentryLevel as Sentry.SeverityLevel);
            }
        });
    }

    private mapLevel(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return 'debug';
            case LogLevel.INFO: return 'info';
            case LogLevel.WARN: return 'warning';
            case LogLevel.ERROR: return 'error';
            case LogLevel.FATAL: return 'fatal';
            default: return 'info';
        }
    }
}
