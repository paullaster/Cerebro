import { Injectable } from '@nestjs/common';
import {
  ILogger,
  LogLevel,
  LogEntry,
} from '../../domain/adapters/logger.service';

@Injectable()
export class ConsoleLogger implements ILogger {
  private currentLevel: LogLevel = LogLevel.INFO;

  private readonly colors = {
    [LogLevel.DEBUG]: '\x1b[34m', // Blue
    [LogLevel.INFO]: '\x1b[32m', // Green
    [LogLevel.WARN]: '\x1b[33m', // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.FATAL]: '\x1b[35m', // Magenta
    reset: '\x1b[0m',
  };

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  debug(context: string, message: string, meta?: Record<string, any>): void {
    this.logEntry({
      level: LogLevel.DEBUG,
      context,
      message,
      meta,
      timestamp: new Date(),
    });
  }

  info(context: string, message: string, meta?: Record<string, any>): void {
    this.logEntry({
      level: LogLevel.INFO,
      context,
      message,
      meta,
      timestamp: new Date(),
    });
  }

  warn(context: string, message: string, meta?: Record<string, any>): void {
    this.logEntry({
      level: LogLevel.WARN,
      context,
      message,
      meta,
      timestamp: new Date(),
    });
  }

  error(
    context: string,
    message: string,
    error?: Error,
    meta?: Record<string, any>,
  ): void {
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

  fatal(
    context: string,
    message: string,
    error?: Error,
    meta?: Record<string, any>,
  ): void {
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

  log(entry: LogEntry): void {
    this.logEntry(entry);
  }

  async time<T>(
    context: string,
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(context, `Performance: ${operation}`, { duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(
        context,
        `Performance: ${operation} failed`,
        error instanceof Error ? error : new Error(String(error)),
        { duration },
      );
      throw error;
    }
  }

  audit(
    actor: string,
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, any>,
  ): void {
    this.info('Audit', `${actor} ${action} ${resource}/${resourceId}`, {
      changes,
    });
  }

  httpRequest(
    method: string,
    url: string,
    status: number,
    duration: number,
    userId?: string,
    meta?: Record<string, any>,
  ): void {
    const level =
      status >= 500
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

  performance(
    context: string,
    duration: number,
    threshold: number,
    meta?: Record<string, any>,
  ): void {
    const level = duration > threshold ? LogLevel.WARN : LogLevel.DEBUG;
    this.logEntry({
      level,
      context: `PERF:${context}`,
      message: `Duration: ${duration}ms (Threshold: ${threshold}ms)`,
      meta,
      timestamp: new Date(),
    });
  }

  async flush(): Promise<void> {
    // Console logger is synchronous, nothing to flush
  }

  private logEntry(entry: LogEntry): void {
    if (entry.level < this.currentLevel) return;

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
}
