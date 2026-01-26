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
import { Injectable, Inject } from '@nestjs/common';
let PerformanceMiddleware = class PerformanceMiddleware {
    logger;
    thresholds = {
        database: 100,
        externalApi: 500,
        pdfGeneration: 2000,
        totalRequest: 1000,
    };
    constructor(logger) {
        this.logger = logger;
    }
    use(req, res, next) {
        const start = Date.now();
        const dbQueryCount = 0;
        const dbQueryTime = 0;
        this.instrumentDatabase();
        const apiCallCount = 0;
        const apiCallTime = 0;
        res.on('finish', () => {
            const totalTime = Date.now() - start;
            this.logger.performance(`HTTP ${req.method} ${req.path}`, totalTime, this.thresholds.totalRequest, {
                dbQueryCount,
                dbQueryTime,
                apiCallCount,
                apiCallTime,
                requestId: req.requestId,
                userId: req.user?.id,
            });
            if (totalTime > this.thresholds.totalRequest) {
                this.logger.warn('Performance', `Request exceeded threshold: ${totalTime}ms`, {
                    threshold: this.thresholds.totalRequest,
                    path: req.path,
                    method: req.method,
                    requestId: req.requestId,
                });
            }
        });
        next();
    }
    instrumentDatabase() {
    }
};
PerformanceMiddleware = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __metadata("design:paramtypes", [Object])
], PerformanceMiddleware);
export { PerformanceMiddleware };
//# sourceMappingURL=performance.middleware.js.map