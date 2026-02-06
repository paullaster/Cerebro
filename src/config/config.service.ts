import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class ConfigService {
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get port(): number {
    return parseInt(process.env.APP_PORT || '3000', 10);
  }

  get databaseUrl(): string {
    return this.getOrThrow('DATABASE_URL');
  }

  get redisUrl(): string {
    return this.getOrThrow('REDIS_URL');
  }

  get jwtSecret(): string {
    return this.getOrThrow('JWT_SECRET');
  }

  get jwtExpiration(): string {
    return process.env.JWT_EXPIRATION || '1d';
  }

  get superAdminEmail(): string {
    return this.getOrThrow('SUPER_ADMIN_EMAIL');
  }

  get superAdminSecret(): string {
    return this.getOrThrow('SUPER_ADMIN_SECRET');
  }

  get clusterEnabled(): boolean {
    return process.env.CLUSTER_ENABLED === 'true';
  }

  get workersCount(): number | 'auto' {
    const count = process.env.WORKERS_COUNT;
    if (!count || count === 'auto') {
      return 'auto';
    }
    return parseInt(count, 10);
  }

  get frontendUrls(): string[] {
    const urls = process.env.FRONTEND_URLS;
    if (!urls) return [];
    return urls.split(',').map((url) => url.trim());
  }

  private getOrThrow(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }
}
