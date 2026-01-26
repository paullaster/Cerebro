import { ILogger, LogLevel, LogEntry } from '../../domain/adapters/logger.service.ts';
export declare class CompositeLogger implements ILogger {
    private readonly loggers;
    constructor(loggers: ILogger[]);
    setLevel(level: LogLevel): void;
    debug(context: string, message: string, meta?: Record<string, any>): void;
    info(context: string, message: string, meta?: Record<string, any>): void;
    warn(context: string, message: string, meta?: Record<string, any>): void;
    error(context: string, message: string, error?: Error, meta?: Record<string, any>): void;
    fatal(context: string, message: string, error?: Error, meta?: Record<string, any>): void;
    log(entry: LogEntry): void;
    time<T>(context: string, operation: string, fn: () => Promise<T>): Promise<T>;
    performance(context: string, duration: number, threshold: number, meta?: Record<string, any>): void;
    audit(actor: string, action: string, resource: string, resourceId: string, changes?: Record<string, any>): void;
    httpRequest(method: string, url: string, status: number, duration: number, userId?: string, meta?: Record<string, any>): void;
    flush(): Promise<void>;
}
