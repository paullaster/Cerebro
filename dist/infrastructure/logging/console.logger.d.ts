import { ILogger, LogLevel, LogEntry } from '../../domain/adapters/logger.service';
export declare class ConsoleLogger implements ILogger {
    private currentLevel;
    private readonly colors;
    setLevel(level: LogLevel): void;
    debug(context: string, message: string, meta?: Record<string, any>): void;
    info(context: string, message: string, meta?: Record<string, any>): void;
    warn(context: string, message: string, meta?: Record<string, any>): void;
    error(context: string, message: string, error?: Error, meta?: Record<string, any>): void;
    fatal(context: string, message: string, error?: Error, meta?: Record<string, any>): void;
    log(entry: LogEntry): void;
    time<T>(context: string, operation: string, fn: () => Promise<T>): Promise<T>;
    audit(actor: string, action: string, resource: string, resourceId: string, changes?: Record<string, any>): void;
    httpRequest(method: string, url: string, status: number, duration: number, userId?: string, meta?: Record<string, any>): void;
    performance(context: string, duration: number, threshold: number, meta?: Record<string, any>): void;
    flush(): Promise<void>;
    private logEntry;
}
