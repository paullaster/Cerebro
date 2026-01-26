import { randomBytes } from 'crypto';

/**
 * RFC 9562 UUID Version 7
 * Time-ordered UUID with millisecond precision
 * Format: [timestamp (48 bits)]-[version (4 bits)]-[rand_a (12 bits)]-[variant (2 bits)]-[rand_b (62 bits)]
 */
export class UUIDv7 {
  private readonly value: string;

  constructor(value: string) {
    if (!UUIDv7.isValid(value)) {
      throw new Error(`Invalid UUID v7: ${value}`);
    }
    this.value = value;
  }

  static generate(): UUIDv7 {
    const timestamp = Date.now();

    // 48-bit timestamp (milliseconds since Unix epoch)
    const timestampHex = Math.floor(timestamp).toString(16).padStart(12, '0');

    // Version 7 (0111) in 4 bits
    const version = '7';

    // 12 bits of random
    const randA = randomBytes(2).toString('hex').substring(0, 3);

    // Variant (10) in 2 bits
    const variant = '8'; // 10xx in binary

    // 62 bits of random
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

  static isValid(uuid: string): boolean {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  getTimestamp(): number {
    const parts = this.value.split('-');
    const timestampHex = parts[0] + parts[1];
    return parseInt(timestampHex, 16);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UUIDv7): boolean {
    return this.value === other.value;
  }
}
