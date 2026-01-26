import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ILogger } from '../../../domain/adapters/logger.service.ts';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject('ILogger') private readonly logger: ILogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // ... existing status logic ...

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' ? (message as any).message : message,
      error: typeof message === 'object' ? (message as any).error : null,
    };

    if (status >= 500) {
      this.logger.error(
        'HttpExceptionFilter',
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception : new Error(String(exception)),
        { errorResponse, userId: (request as any).user?.id },
      );
    } else {
      this.logger.warn(
        'HttpExceptionFilter',
        `${request.method} ${request.url} - ${status}`,
        { errorResponse, userId: (request as any).user?.id },
      );
    }

    response.status(status).json(errorResponse);
  }
}
