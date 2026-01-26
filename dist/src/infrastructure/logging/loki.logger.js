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
import { LokiTransport } from 'winston-loki';
import winston from 'winston';
import { LogLevel, } from '../../domain/adapters/logger.service';
import { ConfigService } from '../../config/config.service';
let LokiLogger = class LokiLogger {
    configService;
    logger;
    constructor(configService) {
        this.configService = configService;
        const lokiConfig = {
            host: configService.lokiHost || 'http://localhost:3100',
            json: true,
            labels: {
                job: 'agricollect-backend',
                env: configService.isProduction ? 'production' : 'development',
                instance: process.env.HOSTNAME || 'unknown',
            },
            timeout: 5000,
            onConnectionError: (err) => console.error('Loki connection error:', err),
        };
        this.logger = winston.createLogger({
            level: configService.logLevel || 'info',
            format: winston.format.json(),
            transports: [
                new LokiTransport(lokiConfig),
                new winston.transports.Console({
                    format: winston.format.simple(),
                }),
            ],
        });
    }
    setLevel(level) {
    }
    log(entry) {
        const levelName = LogLevel[entry.level].toLowerCase();
        this.logger.log(levelName, entry.message, {
            context: entry.context,
            ...entry.meta,
            error: entry.error,
        });
    }
    async time(context, operation, fn) {
        const start = Date.now();
        try {
            const result = await fn();
            this.performance(operation, Date.now() - start, 1000, { context });
            return result;
        }
        catch (error) {
            this.performance(operation, Date.now() - start, 1000, { context, error });
            throw error;
        }
    }
    async flush() {
        return new Promise((resolve) => {
            resolve();
        });
    }
    debug(context, message, meta) {
        this.logger.debug(message, { context, ...meta });
    }
    info(context, message, meta) {
        this.logger.info(message, { context, ...meta });
    }
    warn(context, message, meta) {
        this.logger.warn(message, { context, ...meta });
    }
    error(context, message, error, meta) {
        this.logger.error(message, {
            context,
            error: error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : undefined,
            ...meta,
        });
    }
    fatal(context, message, error, meta) {
        this.logger.log('fatal', message, {
            context,
            error: error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : undefined,
            ...meta,
        });
    }
    transaction(transactionId, action, status, meta) {
        this.logger.info(`Transaction ${action} ${status}`, {
            context: 'Transaction',
            transactionId,
            status,
            ...meta,
        });
    }
    audit(actorId, action, resourceType, resourceId, changes) {
        this.logger.info(`Audit: ${action} on ${resourceType}`, {
            context: 'Audit',
            actorId,
            resourceType,
            resourceId,
            changes,
        });
    }
    httpRequest(method, url, statusCode, duration, userId, meta) {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
        this.logger.log(level, `${method} ${url}`, {
            context: 'HTTP',
            method,
            url,
            statusCode,
            duration,
            userId,
            ...meta,
        });
    }
    performance(operation, duration, threshold, meta) {
        const level = duration > threshold ? 'warn' : 'debug';
        this.logger.log(level, `Performance: ${operation}`, {
            context: 'Performance',
            operation,
            duration,
            threshold,
            exceeded: duration > threshold,
            ...meta,
        });
    }
};
LokiLogger = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof ConfigService !== "undefined" && ConfigService) === "function" ? _a : Object])
], LokiLogger);
export { LokiLogger };
//# sourceMappingURL=loki.logger.js.map