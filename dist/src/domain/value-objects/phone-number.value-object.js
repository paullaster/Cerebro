export class PhoneNumber {
    value;
    countryCode;
    nationalNumber;
    constructor(value, countryCode = '254') {
        const normalized = this.normalize(value, countryCode);
        if (!PhoneNumber.isValid(normalized)) {
            throw new Error(`Invalid phone number: ${value}`);
        }
        this.value = normalized;
        this.countryCode = countryCode;
        this.nationalNumber = normalized.replace(`+${countryCode}`, '');
    }
    normalize(phoneNumber, countryCode) {
        let normalized = phoneNumber.replace(/[^\d+]/g, '');
        if (!normalized.startsWith('+')) {
            if (normalized.startsWith('0')) {
                normalized = `+${countryCode}${normalized.substring(1)}`;
            }
            else {
                normalized = `+${countryCode}${normalized}`;
            }
        }
        return normalized;
    }
    static isValid(phoneNumber) {
        const regex = /^\+[1-9]\d{1,14}$/;
        return regex.test(phoneNumber);
    }
    getValue() {
        return this.value;
    }
    getCountryCode() {
        return this.countryCode;
    }
    getNationalNumber() {
        return this.nationalNumber;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
//# sourceMappingURL=phone-number.value-object.js.map