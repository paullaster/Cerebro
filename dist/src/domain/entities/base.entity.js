import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export class AggregateRoot {
    domainEvents = [];
    addDomainEvent(event) {
        this.domainEvents.push(event);
    }
    getDomainEvents() {
        return [...this.domainEvents];
    }
    clearDomainEvents() {
        this.domainEvents = [];
    }
}
export class Entity extends AggregateRoot {
    id;
    constructor(id) {
        super();
        this.id = id;
    }
    equals(other) {
        if (this === other)
            return true;
        if (!(other instanceof Entity))
            return false;
        return this.id === other.id;
    }
}
export class DomainEvent {
    occurredOn;
    eventId;
    constructor() {
        this.occurredOn = new Date();
        this.eventId = UUIDv7.generate();
    }
}
//# sourceMappingURL=base.entity.js.map