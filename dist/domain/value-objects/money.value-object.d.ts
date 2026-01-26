export declare class Money {
    private readonly amount;
    private readonly currency;
    constructor(amount: number | string, currency?: string);
    static zero(currency?: string): Money;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    divide(divisor: number): Money;
    percentage(percent: number): Money;
    isGreaterThan(other: Money): boolean;
    isLessThan(other: Money): boolean;
    isZero(): boolean;
    getAmount(): number;
    getCurrency(): string;
    toJSON(): {
        amount: number;
        currency: string;
    };
    toString(): string;
    private validateSameCurrency;
}
