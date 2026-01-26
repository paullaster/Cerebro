import { Inject } from '@nestjs/common';
export function LogMethod() {
    const injectLogger = Inject('ILogger');
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        injectLogger(target, 'logger');
        descriptor.value = async function (...args) {
            const logger = this.logger;
            const start = Date.now();
            logger.debug(className, `Method ${propertyKey} called`, {
                arguments: args,
                className,
                methodName: propertyKey,
            });
            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - start;
                logger.debug(className, `Method ${propertyKey} completed`, {
                    duration,
                    className,
                    methodName: propertyKey,
                    result: this.sanitizeResult(result),
                });
                return result;
            }
            catch (error) {
                const duration = Date.now() - start;
                logger.error(className, `Method ${propertyKey} failed`, error, {
                    duration,
                    className,
                    methodName: propertyKey,
                    arguments: args,
                });
                throw error;
            }
        };
        return descriptor;
    };
}
function sanitizeResult(result) {
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
//# sourceMappingURL=log-method.decorator.js.map