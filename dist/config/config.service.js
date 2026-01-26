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
let ConfigService = class ConfigService {
    env;
    constructor() {
        this.env = process.env;
        this.validate();
    }
    validate() {
        const required = [
            'DATABASE_URL',
            'JWT_SECRET',
            'REDIS_URL',
            'SUPER_ADMIN_EMAIL',
            'SUPER_ADMIN_PASSWORD',
        ];
        const missing = required.filter((key) => !this.env[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        if (this.env.JWT_SECRET && this.env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters');
        }
        const cap = parseFloat(this.env.LOAN_RECOVERY_CAP || '0.6');
        if (cap < 0 || cap > 1) {
            throw new Error('LOAN_RECOVERY_CAP must be between 0 and 1');
        }
    }
    get databaseUrl() {
        return this.env.DATABASE_URL;
    }
    get databaseReadReplicaUrl() {
        return this.env.DATABASE_READ_REPLICA_URL;
    }
    get redisUrl() {
        return this.env.REDIS_URL;
    }
    get redisPassword() {
        return this.env.REDIS_PASSWORD;
    }
    get isProduction() {
        return this.env.NODE_ENV === 'production';
    }
    get port() {
        return parseInt(this.env.PORT || '3900', 10);
    }
    get clusterEnabled() {
        return this.env.CLUSTER_ENABLED === 'true';
    }
    get workersCount() {
        if (this.env.WORKERS_COUNT === 'auto')
            return 'auto';
        const count = parseInt(this.env.WORKERS_COUNT || '0', 10);
        return count > 0 ? count : 'auto';
    }
    get jwtSecret() {
        return this.env.JWT_SECRET;
    }
    get jwtExpiration() {
        return this.env.JWT_EXPIRATION || '7d';
    }
    get refreshTokenExpiration() {
        return this.env.REFRESH_TOKEN_EXPIRATION || '30d';
    }
    get encryptionKey() {
        return this.env.ENCRYPTION_KEY || this.jwtSecret.substring(0, 32);
    }
    get throttleTtl() {
        return parseInt(this.env.THROTTLE_TTL || '60', 10);
    }
    get throttleLimit() {
        return parseInt(this.env.THROTTLE_LIMIT || '100', 10);
    }
    get loanRecoveryCap() {
        return parseFloat(this.env.LOAN_RECOVERY_CAP || '0.6');
    }
    get superAdminEmail() {
        return this.env.SUPER_ADMIN_EMAIL;
    }
    get superAdminPassword() {
        return this.env.SUPER_ADMIN_PASSWORD;
    }
    get frontendUrls() {
        return (this.env.FRONTEND_URLS || 'http://localhost:3000').split(',');
    }
    get mpesaConsumerKey() {
        return this.env.MPESA_CONSUMER_KEY;
    }
    get mpesaConsumerSecret() {
        return this.env.MPESA_CONSUMER_SECRET;
    }
    get marketRatesApiUrl() {
        return this.env.MARKET_RATES_API_URL;
    }
    get marketRatesApiKey() {
        return this.env.MARKET_RATES_API_KEY;
    }
    get logLevel() {
        return this.env.LOG_LEVEL || 'info';
    }
    get logFormat() {
        return this.env.LOG_FORMAT || 'json';
    }
    get lokiEnabled() {
        return this.env.LOKI_ENABLED === 'true';
    }
    get lokiHost() {
        return this.env.LOKI_HOST;
    }
    get performanceThresholdMs() {
        return parseInt(this.env.PERFORMANCE_THRESHOLD_MS || '1000', 10);
    }
    get slowQueryThresholdMs() {
        return parseInt(this.env.SLOW_QUERY_THRESHOLD_MS || '100', 10);
    }
    get pdfWorkerConcurrency() {
        return parseInt(this.env.PDF_WORKER_CONCURRENCY || '2', 10);
    }
    get pdfTimeoutMs() {
        return parseInt(this.env.PDF_TIMEOUT_MS || '30000', 10);
    }
};
ConfigService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], ConfigService);
export { ConfigService };
//# sourceMappingURL=config.service.js.map