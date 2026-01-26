import { randomBytes } from 'crypto';
export class UUIDv7 {
    value;
    constructor(value) {
        if (!UUIDv7.isValid(value)) {
            throw new Error(`Invalid UUID v7: ${value}`);
        }
        this.value = value;
    }
    static generate() {
        const timestamp = Date.now();
        const timestampHex = Math.floor(timestamp).toString(16).padStart(12, '0');
        const version = '7';
        const randA = randomBytes(2).toString('hex').substring(0, 3);
        const variant = '8';
        const randB = randomBytes(8).toString('hex').substring(0, 15);
        const uuid = [
            timestampHex.substring(0, 8),
            timestampHex.substring(8, 12),
            version + randA,
            variant + randB.substring(0, 3),
            randB.substring(3),
        ].join('-');
        return new UUIDv7(uuid);
    }
    static isValid(uuid) {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    }
    getTimestamp() {
        const parts = this.value.split('-');
        const timestampHex = parts[0] + parts[1];
        return parseInt(timestampHex, 16);
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
}
//# sourceMappingURL=uuid-v7.value-object.js.map