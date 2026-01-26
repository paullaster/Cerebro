import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export declare enum OtpType {
    PHONE = "PHONE",
    EMAIL = "EMAIL"
}
export declare class OtpVerification extends Entity<UUIDv7> {
    readonly identifier: string;
    readonly codeHash: string;
    readonly type: OtpType;
    readonly expiresAt: Date;
    constructor(id: UUIDv7, identifier: string, codeHash: string, type: OtpType, expiresAt: Date);
    static create(props: {
        identifier: string;
        codeHash: string;
        type: OtpType;
        expiresAt: Date;
    }): OtpVerification;
    isValid(now?: Date): boolean;
}
