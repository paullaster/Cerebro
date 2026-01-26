var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
import { Injectable, Inject } from '@nestjs/common';
import { ILogger } from '../../domain/adapters/logger.service';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.value-object';
let AuditLogService = class AuditLogService {
    logger;
    auditLogRepository;
    constructor(logger, auditLogRepository) {
        this.logger = logger;
        this.auditLogRepository = auditLogRepository;
    }
    async log(entry) {
        try {
            this.logger.audit(entry.actorId, entry.action, entry.resourceType, entry.resourceId, {
                oldValue: entry.oldValue,
                newValue: entry.newValue,
                ipAddress: entry.ipAddress,
                userAgent: entry.userAgent,
                ...entry.metadata,
            });
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
        }
        catch (error) {
            this.logger.error('AuditLogService', 'Failed to log audit entry', error, {
                entry,
            });
        }
    }
    async logCollectionAction(actorId, action, collectionId, oldValue, newValue, metadata) {
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
    async logUserAction(actorId, action, userId, changes, metadata) {
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
    async logFinancialAction(actorId, action, resourceId, amount, metadata) {
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
};
AuditLogService = __decorate([
    Injectable(),
    __param(0, Inject('ILogger')),
    __param(1, Inject('IAuditLogRepository')),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger !== "undefined" && ILogger) === "function" ? _a : Object, typeof (_b = typeof IAuditLogRepository !== "undefined" && IAuditLogRepository) === "function" ? _b : Object])
], AuditLogService);
export { AuditLogService };
//# sourceMappingURL=audit-log.service.js.map