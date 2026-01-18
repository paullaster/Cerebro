import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../../domain/adapters/logger.service.ts';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
    private readonly thresholds = {
        database: 100, // 100ms
        externalApi: 500, // 500ms
        pdfGeneration: 2000, // 2 seconds
        totalRequest: 1000, // 1 second
    };

    constructor(@Inject('ILogger') private readonly logger: ILogger) { }

    use(req: Request, res: Response, next: NextFunction): void {
        const start = Date.now();

        // Track database queries
        let dbQueryCount = 0;
        let dbQueryTime = 0;

        // Override database service methods to track performance
        this.instrumentDatabase();

        // Track external API calls
        let apiCallCount = 0;
        let apiCallTime = 0;

        res.on('finish', () => {
            const totalTime = Date.now() - start;

            // Log overall performance
            this.logger.performance(
                `HTTP ${req.method} ${req.path}`,
                totalTime,
                this.thresholds.totalRequest,
                {
                    dbQueryCount,
                    dbQueryTime,
                    apiCallCount,
                    apiCallTime,
                    requestId: (req as any).requestId,
                    userId: (req as any).user?.id,
                }
            );

            // Alert on performance issues
            if (totalTime > this.thresholds.totalRequest) {
                this.logger.warn(
                    'Performance',
                    `Request exceeded threshold: ${totalTime}ms`,
                    {
                        threshold: this.thresholds.totalRequest,
                        path: req.path,
                        method: req.method,
                        requestId: (req as any).requestId,
                    }
                );
            }
        });

        next();
    }

    private instrumentDatabase(): void {
        // This would require patching Prisma Client or using middleware
        // For Prisma, you can use $on('query') event
        // Example implementation in PrismaService
    }
}