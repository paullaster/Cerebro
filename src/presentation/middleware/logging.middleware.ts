import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../../domain/adapters/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    constructor(@Inject('ILogger') private readonly logger: ILogger) { }

    use(req: Request, res: Response, next: NextFunction): void {
        const start = Date.now();
        const { method, originalUrl, ip, body, headers } = req;

        // Sanitize sensitive data from logs
        const sanitizedBody = this.sanitizeRequestBody(body);
        const userAgent = headers['user-agent'] || 'unknown';

        // Generate request ID for tracing
        const requestId = this.generateRequestId();
        (req as any).requestId = requestId;

        // Log request start
        this.logger.debug(
            'HTTP Request',
            `Incoming ${method} ${originalUrl}`,
            {
                requestId,
                method,
                url: originalUrl,
                ip,
                userAgent,
                body: sanitizedBody,
                userId: (req as any).user?.id,
            }
        );

        // Capture response
        const originalSend = res.send;
        const responseBodyChunks: Buffer[] = [];

        res.send = function (chunk: any): any {
            responseBodyChunks.push(Buffer.from(chunk));
            return originalSend.apply(res, arguments as any);
        };

        // Log when response is finished
        res.on('finish', () => {
            const duration = Date.now() - start;
            const { statusCode } = res;

            // Attempt to parse response body (could be JSON or other)
            let responseBody = {};
            try {
                const fullResponse = Buffer.concat(responseBodyChunks).toString();
                responseBody = JSON.parse(fullResponse);
            } catch {
                // Not JSON, log as text or omit
            }

            // Sanitize response if needed
            const sanitizedResponse = this.sanitizeResponseBody(responseBody);

            this.logger.httpRequest(
                method,
                originalUrl,
                statusCode,
                duration,
                (req as any).user?.id,
                {
                    requestId,
                    ip,
                    userAgent,
                    responseSize: res.getHeader('content-length'),
                    sanitizedResponse,
                }
            );

            // Log slow requests
            if (duration > 1000) { // 1 second threshold
                this.logger.warn(
                    'Slow Request',
                    `${method} ${originalUrl} took ${duration}ms`,
                    {
                        requestId,
                        duration,
                        threshold: 1000,
                        userId: (req as any).user?.id,
                    }
                );
            }
        });

        next();
    }

    private sanitizeRequestBody(body: any): any {
        if (!body) return body;

        const sanitized = { ...body };
        const sensitiveFields = [
            'password',
            'token',
            'secret',
            'creditCard',
            'cvv',
            'ssn',
            'nationalId',
        ];

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    private sanitizeResponseBody(body: any): any {
        if (!body || typeof body !== 'object') return body;

        const sanitized = { ...body };
        const sensitiveFields = ['token', 'refreshToken', 'accessToken', 'hash'];

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }

            if (sanitized.data && sanitized.data[field]) {
                sanitized.data[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}