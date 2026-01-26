export declare class Email {
    private readonly value;
    private readonly localPart;
    private readonly domain;
    constructor(value: string);
    static isValid(email: string): boolean;
    getValue(): string;
    getLocalPart(): string;
    getDomain(): string;
    equals(other: Email): boolean;
    toString(): string;
}
