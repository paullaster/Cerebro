import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';

export enum OtpType {
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
}

export class OtpVerification extends Entity<UUIDv7> {
    constructor(
        id: UUIDv7,
        public readonly identifier: string,
        public readonly codeHash: string,
        public readonly type: OtpType,
        public readonly expiresAt: Date,
    ) {
        super(id);
    }

    static create(props: {
        identifier: string;
        codeHash: string;
        type: OtpType;
        expiresAt: Date;
    }): OtpVerification {
        return new OtpVerification(
            UUIDv7.generate(),
            props.identifier,
            props.codeHash,
            props.type,
            props.expiresAt,
        );
    }

    isValid(now: Date = new Date()): boolean {
        return this.expiresAt > now;
    }
}