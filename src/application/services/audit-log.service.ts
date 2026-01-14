import { Injectable, Inject } from '@nestjs/common';
import { ILogger } from '../../domain/adapters/logger.service';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.value-object';

export interface AuditLogEntry {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
    constructor(
        @Inject('ILogger') private readonly logger: ILogger,
        @Inject('IAuditLogRepository') private readonly auditLogRepository: IAuditLogRepository,
    ) { }

    async log(entry: AuditLogEntry): Promise<void> {
        try {
            // Log to structured logger
            this.logger.audit(
                entry.actorId,
                entry.action,
                entry.resourceType,
                entry.resourceId,
                {
                    oldValue: entry.oldValue,
                    newValue: entry.newValue,
                    ipAddress: entry.ipAddress,
                    userAgent: entry.userAgent,
                    ...entry.metadata,
                }
            );

            // Persist to audit log database
            await this.auditLogRepository.create({
                id: UUIDv7.generate(),
                actorUserId: new UUIDv7(entry.actorId),
                action: entry.action,
                targetResource: entry.resourceType,
                targetId: entry.resourceId,
                oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
                newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
                ipAddress: entry.ipAddress || null,
                userAgent: entry.userAgent || null,
                metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
                timestamp: new Date(),
            });
        } catch (error) {
            // Don't let audit logging failures break the main transaction
            this.logger.error('AuditLogService', 'Failed to log audit entry', error, {
                entry,
            });
        }
    }

    async logCollectionAction(
        actorId: string,
        action: 'CREATE' | 'UPDATE' | 'VERIFY' | 'PAY' | 'CANCEL',
        collectionId: string,
        oldValue?: any,
        newValue?: any,
        metadata?: Record<string, any>,
    ): Promise<void> {
        await this.log({
            actorId,
            action,
            resourceType: 'Collection',
            resourceId: collectionId,
            oldValue,
            newValue,
            metadata,
        });
    }

    async logUserAction(
        actorId: string,
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY',
        userId: string,
        changes?: Record<string, any>,
        metadata?: Record<string, any>,
    ): Promise<void> {
        await this.log({
            actorId,
            action,
            resourceType: 'User',
            resourceId: userId,
            metadata: {
                changes,
                ...metadata,
            },
        });
    }

    async logFinancialAction(
        actorId: string,
        action: 'PAYMENT' | 'REFUND' | 'COMMISSION' | 'LOAN',
        resourceId: string,
        amount?: number,
        metadata?: Record<string, any>,
    ): Promise<void> {
        await this.log({
            actorId,
            action,
            resourceType: 'Financial',
            resourceId,
            metadata: {
                amount,
                ...metadata,
            },
        });
    }
}