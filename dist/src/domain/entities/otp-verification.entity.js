import { Entity } from './base.entity.ts';
import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export var OtpType;
(function (OtpType) {
    OtpType["PHONE"] = "PHONE";
    OtpType["EMAIL"] = "EMAIL";
})(OtpType || (OtpType = {}));
export class OtpVerification extends Entity {
    identifier;
    codeHash;
    type;
    expiresAt;
    constructor(id, identifier, codeHash, type, expiresAt) {
        super(id);
        this.identifier = identifier;
        this.codeHash = codeHash;
        this.type = type;
        this.expiresAt = expiresAt;
    }
    static create(props) {
        return new OtpVerification(UUIDv7.generate(), props.identifier, props.codeHash, props.type, props.expiresAt);
    }
    isValid(now = new Date()) {
        return this.expiresAt > now;
    }
}
//# sourceMappingURL=otp-verification.entity.js.map