export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4,
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

    // Basic logging
    debug(context: string, message: string, meta?: Record<string, any>): void;
    info(context: string, message: string, meta?: Record<string, any>): void;
    warn(context: string, message: string, meta?: Record<string, any>): void;
    error(context: string, message: string, error?: Error, meta?: Record<string, any>): void;
    fatal(context: string, message: string, error?: Error, meta?: Record<string, any>): void;

    // Structured logging
    log(entry: LogEntry): void;

    // Performance logging
    time<T>(context: string, operation: string, fn: () => Promise<T>): Promise<T>;
    
    // Explicit performance logging for middleware
    performance(
        context: string,
        duration: number,
        threshold: number,
        meta?: Record<string, any>
    ): void;

    // Audit logging
    audit(
        actor: string,
        action: string,
        resource: string,
        resourceId: string,
        changes?: Record<string, any>,
    ): void;

    // HTTP request logging
    httpRequest(
        method: string,
        url: string,
        status: number,
        duration: number,
        userId?: string,
        meta?: Record<string, any>,
    ): void;

    // Flush any buffered logs
    flush(): Promise<void>;
}