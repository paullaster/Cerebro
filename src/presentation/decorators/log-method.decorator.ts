import { Inject } from '@nestjs/common';
import { ILogger } from '../../domain/adapters/logger.service.ts';

export function LogMethod() {
    const injectLogger = Inject('ILogger');

    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;

        injectLogger(target, 'logger');

        descriptor.value = async function (...args: any[]) {
            const logger: ILogger = this.logger;
            const start = Date.now();

            logger.debug(
                className,
                `Method ${propertyKey} called`,
                {
                    arguments: args,
                    className,
                    methodName: propertyKey,
                }
            );

            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - start;

                logger.debug(
                    className,
                    `Method ${propertyKey} completed`,
                    {
                        duration,
                        className,
                        methodName: propertyKey,
                        result: this.sanitizeResult(result),
                    }
                );

                return result;
            } catch (error) {
                const duration = Date.now() - start;

                logger.error(
                    className,
                    `Method ${propertyKey} failed`,
                    error,
                    {
                        duration,
                        className,
                        methodName: propertyKey,
                        arguments: args,
                    }
                );

                throw error;
            }
        };

        return descriptor;
    };
}

// Helper to prevent logging sensitive data
function sanitizeResult(result: any): any {
    if (!result || typeof result !== 'object') {
        return result;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'hash'];
    const sanitized = { ...result };

    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
}