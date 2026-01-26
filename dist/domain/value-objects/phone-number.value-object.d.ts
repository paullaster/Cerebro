export declare class PhoneNumber {
    private readonly value;
    private readonly countryCode;
    private readonly nationalNumber;
    constructor(value: string, countryCode?: string);
    private normalize;
    static isValid(phoneNumber: string): boolean;
    getValue(): string;
    getCountryCode(): string;
    getNationalNumber(): string;
    equals(other: PhoneNumber): boolean;
    toString(): string;
}
