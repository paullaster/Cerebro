import { ILogger, LogLevel, LogEntry } from '../../domain/adapters/logger.service';
import { ConfigService } from '../../config/config.service';
export declare class LokiLogger implements ILogger {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    setLevel(level: LogLevel): void;
    log(entry: LogEntry): void;
    time<T>(context: string, operation: string, fn: () => Promise<T>): Promise<T>;
    flush(): Promise<void>;
    debug(context: string, message: string, meta?: Record<string, any>): void;
    info(context: string, message: string, meta?: Record<string, any>): void;
    warn(context: string, message: string, meta?: Record<string, any>): void;
    error(context: string, message: string, error?: Error, meta?: Record<string, any>): void;
    fatal(context: string, message: string, error?: Error, meta?: Record<string, any>): void;
    transaction(transactionId: string, action: string, status: 'started' | 'completed' | 'failed', meta?: Record<string, any>): void;
    audit(actorId: string, action: string, resourceType: string, resourceId: string, changes?: Record<string, any>): void;
    httpRequest(method: string, url: string, statusCode: number, duration: number, userId?: string, meta?: Record<string, any>): void;
    performance(operation: string, duration: number, threshold: number, meta?: Record<string, any>): void;
}
