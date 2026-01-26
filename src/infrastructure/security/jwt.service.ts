import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service.ts';
import { IJwtService } from '../../domain/adapters/jwt.service.ts';
import * as jwt from 'jsonwebtoken'; // Assuming use of jsonwebtoken or verify if NestJS jwt module is preferred?
// Package.json doesn't list jsonwebtoken, but @nestjs/jwt usually wraps it.
// PRD mentions "Passport, JWT" in section 2.3.
// I should check package.json again.

@Injectable()
export class JwtAdapter implements IJwtService {
  constructor(private readonly configService: ConfigService) {}

  sign(payload: any, options?: { expiresIn?: string }): string {
    return jwt.sign(payload, this.configService.jwtSecret, {
      expiresIn: options?.expiresIn || this.configService.jwtExpiration,
    });
  }

  verify(token: string): any {
    try {
      return jwt.verify(token, this.configService.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  decode(token: string): any {
    return jwt.decode(token);
  }
}
