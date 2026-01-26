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
import { Catch, HttpException, HttpStatus, Inject, } from '@nestjs/common';
let HttpExceptionFilter = class HttpExceptionFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';
        const errorResponse = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: typeof message === 'object' ? message.message : message,
            error: typeof message === 'object' ? message.error : null,
        };
        if (status >= 500) {
            this.logger.error('HttpExceptionFilter', `${request.method} ${request.url} - ${status}`, exception instanceof Error ? exception : new Error(String(exception)), { errorResponse, userId: request.user?.id });
        }
        else {
            this.logger.warn('HttpExceptionFilter', `${request.method} ${request.url} - ${status}`, { errorResponse, userId: request.user?.id });
        }
        response.status(status).json(errorResponse);
    }
};
HttpExceptionFilter = __decorate([
    Catch(),
    __param(0, Inject('ILogger')),
    __metadata("design:paramtypes", [Object])
], HttpExceptionFilter);
export { HttpExceptionFilter };
//# sourceMappingURL=http-exception.filter.js.map