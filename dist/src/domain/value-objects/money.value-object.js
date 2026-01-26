export class Money {
    amount;
    currency;
    constructor(amount, currency = 'USD') {
        if (typeof amount === 'string') {
            amount = parseFloat(amount);
        }
        if (isNaN(amount)) {
            throw new Error('Invalid amount');
        }
        if (!Number.isFinite(amount)) {
            throw new Error('Amount must be finite');
        }
        this.amount = Math.round(amount * 10000) / 10000;
        this.currency = currency;
    }
    static zero(currency = 'USD') {
        return new Money(0, currency);
    }
    add(other) {
        this.validateSameCurrency(other);
        return new Money(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        this.validateSameCurrency(other);
        return new Money(this.amount - other.amount, this.currency);
    }
    multiply(factor) {
        if (!Number.isFinite(factor)) {
            throw new Error('Factor must be finite');
        }
        return new Money(this.amount * factor, this.currency);
    }
    divide(divisor) {
        if (divisor === 0) {
            throw new Error('Cannot divide by zero');
        }
        return new Money(this.amount / divisor, this.currency);
    }
    percentage(percent) {
        return this.multiply(percent / 100);
    }
    isGreaterThan(other) {
        this.validateSameCurrency(other);
        return this.amount > other.amount;
    }
    isLessThan(other) {
        this.validateSameCurrency(other);
        return this.amount < other.amount;
    }
    isZero() {
        return this.amount === 0;
    }
    getAmount() {
        return this.amount;
    }
    getCurrency() {
        return this.currency;
    }
    toJSON() {
        return {
            amount: this.amount,
            currency: this.currency,
        };
    }
    toString() {
        return `${this.currency} ${this.amount.toFixed(2)}`;
    }
    validateSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
    }
}
//# sourceMappingURL=money.value-object.js.map