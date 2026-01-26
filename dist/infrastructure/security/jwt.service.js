var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service.ts';
import * as jwt from 'jsonwebtoken';
let JwtAdapter = class JwtAdapter {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    sign(payload, options) {
        return jwt.sign(payload, this.configService.jwtSecret, {
            expiresIn: options?.expiresIn || this.configService.jwtExpiration,
        });
    }
    verify(token) {
        try {
            return jwt.verify(token, this.configService.jwtSecret);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    decode(token) {
        return jwt.decode(token);
    }
};
JwtAdapter = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], JwtAdapter);
export { JwtAdapter };
//# sourceMappingURL=jwt.service.js.map