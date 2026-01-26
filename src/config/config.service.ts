import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly env: NodeJS.ProcessEnv;

  constructor() {
    this.env = process.env;
    this.validate();
  }

  private validate(): void {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'REDIS_URL',
      'SUPER_ADMIN_EMAIL',
      'SUPER_ADMIN_PASSWORD',
    ];

    const missing = required.filter((key) => !this.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }

    // Validate UUID v7 secret for token generation
    if (this.env.JWT_SECRET && this.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }

    // Validate loan recovery cap
    const cap = parseFloat(this.env.LOAN_RECOVERY_CAP || '0.6');
    if (cap < 0 || cap > 1) {
      throw new Error('LOAN_RECOVERY_CAP must be between 0 and 1');
    }
  }

  // Database
  get databaseUrl(): string {
    return this.env.DATABASE_URL!;
  }

  get databaseReadReplicaUrl(): string | undefined {
    return this.env.DATABASE_READ_REPLICA_URL;
  }

  // Redis
  get redisUrl(): string {
    return this.env.REDIS_URL!;
  }

  get redisPassword(): string | undefined {
    return this.env.REDIS_PASSWORD;
  }

  // Server
  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  get port(): number {
    return parseInt(this.env.PORT || '3900', 10);
  }

  get clusterEnabled(): boolean {
    return this.env.CLUSTER_ENABLED === 'true';
  }

  get workersCount(): number | 'auto' {
    if (this.env.WORKERS_COUNT === 'auto') return 'auto';
    const count = parseInt(this.env.WORKERS_COUNT || '0', 10);
    return count > 0 ? count : 'auto';
  }

  // Security
  get jwtSecret(): string {
    return this.env.JWT_SECRET!;
  }

  get jwtExpiration(): string {
    return this.env.JWT_EXPIRATION || '7d';
  }

  get refreshTokenExpiration(): string {
    return this.env.REFRESH_TOKEN_EXPIRATION || '30d';
  }

  get encryptionKey(): string {
    return this.env.ENCRYPTION_KEY || this.jwtSecret.substring(0, 32);
  }

  // Rate limiting
  get throttleTtl(): number {
    return parseInt(this.env.THROTTLE_TTL || '60', 10);
  }

  get throttleLimit(): number {
    return parseInt(this.env.THROTTLE_LIMIT || '100', 10);
  }

  // Financial
  get loanRecoveryCap(): number {
    return parseFloat(this.env.LOAN_RECOVERY_CAP || '0.6');
  }

  // Super admin
  get superAdminEmail(): string {
    return this.env.SUPER_ADMIN_EMAIL!;
  }

  get superAdminPassword(): string {
    return this.env.SUPER_ADMIN_PASSWORD!;
  }

  // Frontend
  get frontendUrls(): string[] {
    return (this.env.FRONTEND_URLS || 'http://localhost:3000').split(',');
  }

  // External services
  get mpesaConsumerKey(): string | undefined {
    return this.env.MPESA_CONSUMER_KEY;
  }

  get mpesaConsumerSecret(): string | undefined {
    return this.env.MPESA_CONSUMER_SECRET;
  }

  get marketRatesApiUrl(): string | undefined {
    return this.env.MARKET_RATES_API_URL;
  }

  get marketRatesApiKey(): string | undefined {
    return this.env.MARKET_RATES_API_KEY;
  }

  // Logging
  get logLevel(): string {
    return this.env.LOG_LEVEL || 'info';
  }

  get logFormat(): string {
    return this.env.LOG_FORMAT || 'json';
  }

  get lokiEnabled(): boolean {
    return this.env.LOKI_ENABLED === 'true';
  }

  get lokiHost(): string | undefined {
    return this.env.LOKI_HOST;
  }

  // Performance
  get performanceThresholdMs(): number {
    return parseInt(this.env.PERFORMANCE_THRESHOLD_MS || '1000', 10);
  }

  get slowQueryThresholdMs(): number {
    return parseInt(this.env.SLOW_QUERY_THRESHOLD_MS || '100', 10);
  }

  // PDF Generation
  get pdfWorkerConcurrency(): number {
    return parseInt(this.env.PDF_WORKER_CONCURRENCY || '2', 10);
  }

  get pdfTimeoutMs(): number {
    return parseInt(this.env.PDF_TIMEOUT_MS || '30000', 10);
  }
}
