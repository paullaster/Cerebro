export class Email {
    value;
    localPart;
    domain;
    constructor(value) {
        if (!Email.isValid(value)) {
            throw new Error(`Invalid email: ${value}`);
        }
        this.value = value.toLowerCase().trim();
        const parts = this.value.split('@');
        this.localPart = parts[0];
        this.domain = parts[1];
    }
    static isValid(email) {
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return regex.test(email);
    }
    getValue() {
        return this.value;
    }
    getLocalPart() {
        return this.localPart;
    }
    getDomain() {
        return this.domain;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
//# sourceMappingURL=email.value-object.js.map