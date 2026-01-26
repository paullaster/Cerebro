export declare abstract class DomainException extends Error {
    readonly code: string;
    readonly metadata?: Record<string, any> | undefined;
    constructor(message: string, code: string, metadata?: Record<string, any> | undefined);
}
export declare class EntityNotFoundException extends DomainException {
    constructor(entityName: string, id: string);
}
export declare class EntityAlreadyExistsException extends DomainException {
    constructor(entityName: string, field: string, value: string);
}
export declare class ValidationException extends DomainException {
    constructor(message: string, field?: string);
}
export declare class BusinessRuleException extends DomainException {
    constructor(message: string, rule: string);
}
export declare class InsufficientFundsException extends DomainException {
    constructor(current: number, required: number);
}
export declare class InvalidStateException extends DomainException {
    constructor(entity: string, currentState: string, requiredState: string);
}
export declare class ConflictException extends DomainException {
    constructor(message: string);
}
