var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
import { Injectable, Inject } from '@nestjs/common';
import { ILogger } from '../../domain/adapters/logger.service';
let LoggingMiddleware = class LoggingMiddleware {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    use(req, res, next) {
        const start = Date.now();
        const { method, originalUrl, ip, body, headers } = req;
        const sanitizedBody = this.sanitizeRequestBody(body);
        const userAgent = headers['user-agent'] || 'unknown';
        const requestId = this.generateRequestId();
        req.requestId = requestId;
        this.logger.debug('HTTP Request', `Incoming ${method} ${originalUrl}`, {
            requestId,
            method,
            url: originalUrl,
            ip,
            userAgent,
            body: sanitizedBody,
            userId: req.user?.id,
        });
        const originalSend = res.send;
        const responseBodyChunks = [];
        res.send = function (chunk) {
            responseBodyChunks.push(Buffer.from(chunk));
            return originalSend.apply(res, arguments);
        };
        res.on('finish', () => {
            const duration = Date.now() - start;
            const { statusCode } = res;
            let responseBody = {};
            try {
                const fullResponse = Buffer.concat(responseBodyChunks).toString();
                responseBody = JSON.parse(fullResponse);
            }
            catch {
            }
            const sanitizedResponse = this.sanitizeResponseBody(responseBody);
            this.logger.httpRequest(method, originalUrl, statusCode, duration, req.user?.id, {
                requestId,
                ip,
                userAgent,
                responseSize: res.getHeader('content-length'),
                sanitizedResponse,
            });
            if (duration > 1000) {
                this.logger.warn('Slow Request', `${method} ${originalUrl} took ${duration}ms`, {
                    requestId,
                    duration,
                    threshold: 1000,
                    userId: req.user?.id,
                });
            }
        });
        next();
    }
    sanitizeRequestBody(body) {
        if (!body)
            return body;
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
    sanitizeResponseBody(body) {
        if (!body || typeof body !== 'object')
            return body;
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
    generateRequestId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};
LoggingMiddleware = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger !== "undefined" && ILogger) === "function" ? _a : Object])
], LoggingMiddleware);
export { LoggingMiddleware };
//# sourceMappingURL=logging.middleware.js.map