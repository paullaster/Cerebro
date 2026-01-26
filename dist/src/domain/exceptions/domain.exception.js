export class DomainException extends Error {
    code;
    metadata;
    constructor(message, code, metadata) {
        super(message);
        this.code = code;
        this.metadata = metadata;
        this.name = this.constructor.name;
    }
}
export class EntityNotFoundException extends DomainException {
    constructor(entityName, id) {
        super(`${entityName} with ID ${id} not found`, 'ENTITY_NOT_FOUND', {
            entityName,
            id,
        });
    }
}
export class EntityAlreadyExistsException extends DomainException {
    constructor(entityName, field, value) {
        super(`${entityName} with ${field} ${value} already exists`, 'ENTITY_CONFLICT', {
            entityName,
            field,
            value,
        });
    }
}
export class ValidationException extends DomainException {
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR', { field });
    }
}
export class BusinessRuleException extends DomainException {
    constructor(message, rule) {
        super(message, 'BUSINESS_RULE_VIOLATION', { rule });
    }
}
export class InsufficientFundsException extends DomainException {
    constructor(current, required) {
        super(`Insufficient funds: ${current} available, ${required} required`, 'INSUFFICIENT_FUNDS', {
            current,
            required,
        });
    }
}
export class InvalidStateException extends DomainException {
    constructor(entity, currentState, requiredState) {
        super(`${entity} is in ${currentState} state, but ${requiredState} is required`, 'INVALID_STATE', {
            entity,
            currentState,
            requiredState,
        });
    }
}
export class ConflictException extends DomainException {
    constructor(message) {
        super(message, 'CONFLICT');
    }
}
//# sourceMappingURL=domain.exception.js.map