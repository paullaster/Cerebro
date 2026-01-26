import { ILogger } from '../../domain/adapters/logger.service';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
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
export declare class AuditLogService {
    private readonly logger;
    private readonly auditLogRepository;
    constructor(logger: ILogger, auditLogRepository: IAuditLogRepository);
    log(entry: AuditLogEntry): Promise<void>;
    logCollectionAction(actorId: string, action: 'CREATE' | 'UPDATE' | 'VERIFY' | 'PAY' | 'CANCEL', collectionId: string, oldValue?: any, newValue?: any, metadata?: Record<string, any>): Promise<void>;
    logUserAction(actorId: string, action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY', userId: string, changes?: Record<string, any>, metadata?: Record<string, any>): Promise<void>;
    logFinancialAction(actorId: string, action: 'PAYMENT' | 'REFUND' | 'COMMISSION' | 'LOAN', resourceId: string, amount?: number, metadata?: Record<string, any>): Promise<void>;
}
