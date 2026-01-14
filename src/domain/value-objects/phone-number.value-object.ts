export class PhoneNumber {
    private readonly value: string;
    private readonly countryCode: string;
    private readonly nationalNumber: string;

    constructor(value: string, countryCode: string = '254') {
        const normalized = this.normalize(value, countryCode);

        if (!PhoneNumber.isValid(normalized)) {
            throw new Error(`Invalid phone number: ${value}`);
        }

        this.value = normalized;
        this.countryCode = countryCode;
        this.nationalNumber = normalized.replace(`+${countryCode}`, '');
    }

    private normalize(phoneNumber: string, countryCode: string): string {
        // Remove all non-digit characters except leading +
        let normalized = phoneNumber.replace(/[^\d+]/g, '');

        // Add country code if missing
        if (!normalized.startsWith('+')) {
            if (normalized.startsWith('0')) {
                // Replace leading 0 with country code
                normalized = `+${countryCode}${normalized.substring(1)}`;
            } else {
                normalized = `+${countryCode}${normalized}`;
            }
        }

        return normalized;
    }

    static isValid(phoneNumber: string): boolean {
        // E.164 format validation
        const regex = /^\+[1-9]\d{1,14}$/;
        return regex.test(phoneNumber);
    }

    getValue(): string {
        return this.value;
    }

    getCountryCode(): string {
        return this.countryCode;
    }

    getNationalNumber(): string {
        return this.nationalNumber;
    }

    equals(other: PhoneNumber): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}