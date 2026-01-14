import { Injectable } from '@nestjs/common';
import { LokiTransport } from 'winston-loki';
import winston from 'winston';
import { ILogger, LogLevel } from '../../domain/adapters/logger.service';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class LokiLogger implements ILogger {
    private readonly logger: winston.Logger;

    constructor(private readonly configService: ConfigService) {
        const lokiConfig = {
            host: configService.lokiHost || 'http://localhost:3100',
            json: true,
            labels: {
                job: 'agricollect-backend',
                env: configService.isProduction ? 'production' : 'development',
                instance: process.env.HOSTNAME || 'unknown',
            },
            timeout: 5000,
            onConnectionError: (err: Error) => console.error('Loki connection error:', err),
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

    debug(context: string, message: string, meta?: Record<string, any>): void {
        this.logger.debug(message, { context, ...meta });
    }

    info(context: string, message: string, meta?: Record<string, any>): void {
        this.logger.info(message, { context, ...meta });
    }

    warn(context: string, message: string, meta?: Record<string, any>): void {
        this.logger.warn(message, { context, ...meta });
    }

    error(context: string, message: string, error?: Error, meta?: Record<string, any>): void {
        this.logger.error(message, {
            context,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined,
            ...meta
        });
    }

    fatal(context: string, message: string, error?: Error, meta?: Record<string, any>): void {
        this.logger.log('fatal', message, {
            context,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined,
            ...meta
        });
    }

    transaction(
        transactionId: string,
        action: string,
        status: 'started' | 'completed' | 'failed',
        meta?: Record<string, any>,
    ): void {
        this.logger.info(`Transaction ${action} ${status}`, {
            context: 'Transaction',
            transactionId,
            status,
            ...meta,
        });
    }

    audit(
        actorId: string,
        action: string,
        resourceType: string,
        resourceId: string,
        changes?: Record<string, any>,
    ): void {
        this.logger.info(`Audit: ${action} on ${resourceType}`, {
            context: 'Audit',
            actorId,
            resourceType,
            resourceId,
            changes,
        });
    }

    httpRequest(
        method: string,
        url: string,
        statusCode: number,
        duration: number,
        userId?: string,
        meta?: Record<string, any>,
    ): void {
        const level = statusCode >= 500 ? 'error' :
            statusCode >= 400 ? 'warn' : 'info';

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

    performance(
        operation: string,
        duration: number,
        threshold: number,
        meta?: Record<string, any>,
    ): void {
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
}