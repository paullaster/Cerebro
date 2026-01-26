import { Injectable } from '@nestjs/common';
import {
  ILogger,
  LogLevel,
  LogEntry,
} from '../../domain/adapters/logger.service.ts';

@Injectable()
export class CompositeLogger implements ILogger {
  constructor(private readonly loggers: ILogger[]) {}

  setLevel(level: LogLevel): void {
    this.loggers.forEach((l) => l.setLevel(level));
  }

  debug(context: string, message: string, meta?: Record<string, any>): void {
    this.loggers.forEach((l) => l.debug(context, message, meta));
  }

  info(context: string, message: string, meta?: Record<string, any>): void {
    this.loggers.forEach((l) => l.info(context, message, meta));
  }

  warn(context: string, message: string, meta?: Record<string, any>): void {
    this.loggers.forEach((l) => l.warn(context, message, meta));
  }

  error(
    context: string,
    message: string,
    error?: Error,
    meta?: Record<string, any>,
  ): void {
    this.loggers.forEach((l) => l.error(context, message, error, meta));
  }

  fatal(
    context: string,
    message: string,
    error?: Error,
    meta?: Record<string, any>,
  ): void {
    this.loggers.forEach((l) => l.fatal(context, message, error, meta));
  }

  log(entry: LogEntry): void {
    this.loggers.forEach((l) => l.log(entry));
  }

  async time<T>(
    context: string,
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    // We only want one logger to handle the timing logic to avoid duplicate execution
    // But we want all loggers to potentially record the result/spans.
    // For simplicity, we'll let the first logger handle it or just wrap manually.
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

  performance(
    context: string,
    duration: number,
    threshold: number,
    meta?: Record<string, any>,
  ): void {
    this.loggers.forEach((l) =>
      l.performance(context, duration, threshold, meta),
    );
  }

  audit(
    actor: string,
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, any>,
  ): void {
    this.loggers.forEach((l) =>
      l.audit(actor, action, resource, resourceId, changes),
    );
  }

  httpRequest(
    method: string,
    url: string,
    status: number,
    duration: number,
    userId?: string,
    meta?: Record<string, any>,
  ): void {
    this.loggers.forEach((l) =>
      l.httpRequest(method, url, status, duration, userId, meta),
    );
  }

  async flush(): Promise<void> {
    await Promise.all(this.loggers.map((l) => l.flush()));
  }
}
