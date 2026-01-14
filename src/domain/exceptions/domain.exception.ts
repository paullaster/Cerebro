export abstract class DomainException extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly metadata?: Record<string, any>,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class EntityNotFoundException extends DomainException {
    constructor(entityName: string, id: string) {
        super(`${entityName} with ID ${id} not found`, 'ENTITY_NOT_FOUND', {
            entityName,
            id,
        });
    }
}

export class EntityAlreadyExistsException extends DomainException {
    constructor(entityName: string, field: string, value: string) {
        super(`${entityName} with ${field} ${value} already exists`, 'ENTITY_CONFLICT', {
            entityName,
            field,
            value,
        });
    }
}

export class ValidationException extends DomainException {
    constructor(message: string, field?: string) {
        super(message, 'VALIDATION_ERROR', { field });
    }
}

export class BusinessRuleException extends DomainException {
    constructor(message: string, rule: string) {
        super(message, 'BUSINESS_RULE_VIOLATION', { rule });
    }
}

export class InsufficientFundsException extends DomainException {
    constructor(current: number, required: number) {
        super(`Insufficient funds: ${current} available, ${required} required`, 'INSUFFICIENT_FUNDS', {
            current,
            required,
        });
    }
}

export class InvalidStateException extends DomainException {
    constructor(entity: string, currentState: string, requiredState: string) {
        super(`${entity} is in ${currentState} state, but ${requiredState} is required`, 'INVALID_STATE', {
            entity,
            currentState,
            requiredState,
        });
    }
}