export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    context: string;
    timestamp: Date;
    meta?: Record<string, any>;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}
export interface ILogger {
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
