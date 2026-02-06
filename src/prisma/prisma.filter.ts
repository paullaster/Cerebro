import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');
    console.error(`[Prisma Error ${exception.code}]: ${message}`);

    switch (exception.code) {
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: 'The requested record was not found.',
        });
        break;
      }
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: `Duplicate field: ${String(exception.meta?.target)}`,
        });
        break;
      }
      default: {
        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          message: 'An unexpected error occurred.',
        });
        break;
      }
    }
  }
}
