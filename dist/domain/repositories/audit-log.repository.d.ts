import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export interface AuditLogProps {
    id: UUIDv7;
    actorUserId: UUIDv7;
    action: string;
    targetResource: string;
    targetId: string;
    oldValue: string | null;
    newValue: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: string | null;
    timestamp: Date;
}
export interface IAuditLogRepository {
    create(props: AuditLogProps): Promise<void>;
}
