import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export declare abstract class AggregateRoot {
    private domainEvents;
    protected addDomainEvent(event: DomainEvent): void;
    getDomainEvents(): DomainEvent[];
    clearDomainEvents(): void;
}
export declare abstract class Entity<ID> extends AggregateRoot {
    readonly id: ID;
    constructor(id: ID);
    equals(other: Entity<ID>): boolean;
}
export declare abstract class DomainEvent {
    readonly occurredOn: Date;
    readonly eventId: UUIDv7;
    constructor();
    abstract getEventName(): string;
}
