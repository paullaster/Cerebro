var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { LogLevel, } from '../../domain/adapters/logger.service';
let ConsoleLogger = class ConsoleLogger {
    currentLevel = LogLevel.INFO;
    colors = {
        [LogLevel.DEBUG]: '\x1b[34m',
        [LogLevel.INFO]: '\x1b[32m',
        [LogLevel.WARN]: '\x1b[33m',
        [LogLevel.ERROR]: '\x1b[31m',
        [LogLevel.FATAL]: '\x1b[35m',
        reset: '\x1b[0m',
    };
    setLevel(level) {
        this.currentLevel = level;
    }
    debug(context, message, meta) {
        this.logEntry({
            level: LogLevel.DEBUG,
            context,
            message,
            meta,
            timestamp: new Date(),
        });
    }
    info(context, message, meta) {
        this.logEntry({
            level: LogLevel.INFO,
            context,
            message,
            meta,
            timestamp: new Date(),
        });
    }
    warn(context, message, meta) {
        this.logEntry({
            level: LogLevel.WARN,
            context,
            message,
            meta,
            timestamp: new Date(),
        });
    }
    error(context, message, error, meta) {
        this.logEntry({
            level: LogLevel.ERROR,
            context,
            message,
            meta,
            error: error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : undefined,
            timestamp: new Date(),
        });
    }
    fatal(context, message, error, meta) {
        this.logEntry({
            level: LogLevel.FATAL,
            context,
            message,
            meta,
            error: error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : undefined,
            timestamp: new Date(),
        });
    }
    log(entry) {
        this.logEntry(entry);
    }
    async time(context, operation, fn) {
        const start = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - start;
            this.info(context, `Performance: ${operation}`, { duration });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.error(context, `Performance: ${operation} failed`, error instanceof Error ? error : new Error(String(error)), { duration });
            throw error;
        }
    }
    audit(actor, action, resource, resourceId, changes) {
        this.info('Audit', `${actor} ${action} ${resource}/${resourceId}`, {
            changes,
        });
    }
    httpRequest(method, url, status, duration, userId, meta) {
        const level = status >= 500
            ? LogLevel.ERROR
            : status >= 400
                ? LogLevel.WARN
                : LogLevel.INFO;
        this.logEntry({
            level,
            context: 'HTTP',
            message: `${method} ${url} ${status} ${duration}ms`,
            meta: { ...meta, userId },
            timestamp: new Date(),
        });
    }
    performance(context, duration, threshold, meta) {
        const level = duration > threshold ? LogLevel.WARN : LogLevel.DEBUG;
        this.logEntry({
            level,
            context: `PERF:${context}`,
            message: `Duration: ${duration}ms (Threshold: ${threshold}ms)`,
            meta,
            timestamp: new Date(),
        });
    }
    async flush() {
    }
    logEntry(entry) {
        if (entry.level < this.currentLevel)
            return;
        const color = this.colors[entry.level] || this.colors.reset;
        const levelName = LogLevel[entry.level];
        const timestamp = entry.timestamp.toISOString();
        let output = `${color}[${timestamp}] [${levelName}] [${entry.context}] ${entry.message}${this.colors.reset}`;
        if (entry.meta && Object.keys(entry.meta).length > 0) {
            output += `\nMeta: ${JSON.stringify(entry.meta)}`;
        }
        if (entry.error) {
            output += `\nError: ${entry.error.name}: ${entry.error.message}\n${entry.error.stack || ''}`;
        }
        console.log(output);
    }
};
ConsoleLogger = __decorate([
    Injectable()
], ConsoleLogger);
export { ConsoleLogger };
//# sourceMappingURL=console.logger.js.map