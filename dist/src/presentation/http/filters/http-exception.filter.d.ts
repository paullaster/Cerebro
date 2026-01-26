import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: ILogger);
    catch(exception: unknown, host: ArgumentsHost): void;
}
