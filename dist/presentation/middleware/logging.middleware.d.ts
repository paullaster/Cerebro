import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../../domain/adapters/logger.service';
export declare class LoggingMiddleware implements NestMiddleware {
    private readonly logger;
    constructor(logger: ILogger);
    use(req: Request, res: Response, next: NextFunction): void;
    private sanitizeRequestBody;
    private sanitizeResponseBody;
    private generateRequestId;
}
