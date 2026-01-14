export class Email {
    private readonly value: string;
    private readonly localPart: string;
    private readonly domain: string;

    constructor(value: string) {
        if (!Email.isValid(value)) {
            throw new Error(`Invalid email: ${value}`);
        }

        this.value = value.toLowerCase().trim();
        const parts = this.value.split('@');
        this.localPart = parts[0];
        this.domain = parts[1];
    }

    static isValid(email: string): boolean {
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return regex.test(email);
    }

    getValue(): string {
        return this.value;
    }

    getLocalPart(): string {
        return this.localPart;
    }

    getDomain(): string {
        return this.domain;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}