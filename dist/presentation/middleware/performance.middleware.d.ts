import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../../domain/adapters/logger.service.ts';
export declare class PerformanceMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly thresholds;
    constructor(logger: ILogger);
    use(req: Request, res: Response, next: NextFunction): void;
    private instrumentDatabase;
}
