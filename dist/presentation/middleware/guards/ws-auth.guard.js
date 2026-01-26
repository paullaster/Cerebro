var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable, } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
let WsAuthGuard = class WsAuthGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const client = context.switchToWs().getClient();
        const token = client.handshake.auth.token ||
            client.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new WsException('Unauthorized');
        }
        try {
            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            return true;
        }
        catch (error) {
            throw new WsException('Unauthorized');
        }
    }
};
WsAuthGuard = __decorate([
    Injectable(),
    __param(0, Inject('IJwtService')),
    __metadata("design:paramtypes", [Object])
], WsAuthGuard);
export { WsAuthGuard };
//# sourceMappingURL=ws-auth.guard.js.map