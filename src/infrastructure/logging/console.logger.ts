import { Injectable } from '@nestjs/common';
import { ILogger } from '../../domain/adapters/logger.service';

@Injectable()
export class ConsoleLogger implements ILogger {
    private readonly colors = {
        debug: '\x1b[34m', // Blue
        info: '\x1b[32m', // Green
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        fatal: '\x1b[35m', // Magenta
        reset: '\x1b[0m',
    };

    debug(context: string, message: string, meta?: Record<string, any>): void {
        this.log('debug', context, message, meta);
    }

    info(context: string, message: string, meta?: Record<string, any>): void {
        this.log('info', context, message, meta);
    }

    warn(context: string, message: string, meta?: Record<string, any>): void {
        this.log('warn', context, message, meta);
    }

    error(context: string, message: string, error?: Error, meta?: Record<string, any>): void {
        this.log('error', context, message, { ...meta, error });
    }

    fatal(context: string, message: string, error?: Error, meta?: Record<string, any>): void {
        this.log('fatal', context, message, { ...meta, error });
    }

    private log(
        level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
        context: string,
        message: string,
        meta?: Record<string, any>,
    ): void {
        const timestamp = new Date().toISOString();
        const color = this.colors[level];
        const reset = this.colors.reset;

        let logMessage = `${color}[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}${reset}`;

        if (meta && Object.keys(meta).length > 0) {
            logMessage += `\n${JSON.stringify(meta, null, 2)}`;
        }

        console.log(logMessage);
    }

    transaction(
        transactionId: string,
        action: string,
        status: 'started' | 'completed' | 'failed',
        meta?: Record<string, any>,
    ): void {
        console.log(`[Transaction] ${action} ${status} - ID: ${transactionId}`, meta);
    }

    audit(
        actorId: string,
        action: string,
        resourceType: string,
        resourceId: string,
        changes?: Record<string, any>,
    ): void {
        console.log(`[Audit] ${actorId} ${action} ${resourceType}/${resourceId}`, changes);
    }

    httpRequest(
        method: string,
        url: string,
        statusCode: number,
        duration: number,
        userId?: string,
        meta?: Record<string, any>,
    ): void {
        const statusColor = statusCode >= 500 ? this.colors.error :
            statusCode >= 400 ? this.colors.warn : this.colors.info;

        console.log(
            `${statusColor}[HTTP] ${method} ${url} ${statusCode} ${duration}ms${this.colors.reset}`,
            { userId, ...meta }
        );
    }

    performance(
        operation: string,
        duration: number,
        threshold: number,
        meta?: Record<string, any>,
    ): void {
        const color = duration > threshold ? this.colors.warn : this.colors.debug;
        console.log(
            `${color}[Performance] ${operation} ${duration}ms (threshold: ${threshold}ms)${this.colors.reset}`,
            meta
        );
    }
}