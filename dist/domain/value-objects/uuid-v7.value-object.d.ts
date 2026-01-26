export declare class UUIDv7 {
    private readonly value;
    constructor(value: string);
    static generate(): UUIDv7;
    static isValid(uuid: string): boolean;
    getTimestamp(): number;
    toString(): string;
    equals(other: UUIDv7): boolean;
}
