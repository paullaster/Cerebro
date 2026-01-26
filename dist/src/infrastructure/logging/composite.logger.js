var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
let CompositeLogger = class CompositeLogger {
    loggers;
    constructor(loggers) {
        this.loggers = loggers;
    }
    setLevel(level) {
        this.loggers.forEach((l) => l.setLevel(level));
    }
    debug(context, message, meta) {
        this.loggers.forEach((l) => l.debug(context, message, meta));
    }
    info(context, message, meta) {
        this.loggers.forEach((l) => l.info(context, message, meta));
    }
    warn(context, message, meta) {
        this.loggers.forEach((l) => l.warn(context, message, meta));
    }
    error(context, message, error, meta) {
        this.loggers.forEach((l) => l.error(context, message, error, meta));
    }
    fatal(context, message, error, meta) {
        this.loggers.forEach((l) => l.fatal(context, message, error, meta));
    }
    log(entry) {
        this.loggers.forEach((l) => l.log(entry));
    }
    async time(context, operation, fn) {
        const start = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - start;
            this.info(context, `Performance: ${operation}`, { duration });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.error(context, `Performance: ${operation} failed`, error instanceof Error ? error : new Error(String(error)), { duration });
            throw error;
        }
    }
    performance(context, duration, threshold, meta) {
        this.loggers.forEach((l) => l.performance(context, duration, threshold, meta));
    }
    audit(actor, action, resource, resourceId, changes) {
        this.loggers.forEach((l) => l.audit(actor, action, resource, resourceId, changes));
    }
    httpRequest(method, url, status, duration, userId, meta) {
        this.loggers.forEach((l) => l.httpRequest(method, url, status, duration, userId, meta));
    }
    async flush() {
        await Promise.all(this.loggers.map((l) => l.flush()));
    }
};
CompositeLogger = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Array])
], CompositeLogger);
export { CompositeLogger };
//# sourceMappingURL=composite.logger.js.map