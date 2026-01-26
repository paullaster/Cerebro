import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';

export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }
}

export abstract class Entity<ID> extends AggregateRoot {
  constructor(public readonly id: ID) {
    super();
  }

  equals(other: Entity<ID>): boolean {
    if (this === other) return true;
    if (!(other instanceof Entity)) return false;
    return this.id === other.id;
  }
}

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: UUIDv7;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = UUIDv7.generate();
  }

  abstract getEventName(): string;
}
