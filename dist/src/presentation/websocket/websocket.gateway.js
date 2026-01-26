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
var AppGateway_1;
var _a, _b;
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { WsAuthGuard } from '../middleware/guards/ws-auth.guard.ts';
import { ConfigService } from '../../config/config.service.ts';
let AppGateway = AppGateway_1 = class AppGateway {
    configService;
    jwtService;
    server;
    logger = new Logger(AppGateway_1.name);
    redisAdapter;
    constructor(configService, jwtService) {
        this.configService = configService;
        this.jwtService = jwtService;
        if (configService.isProduction || configService.clusterEnabled) {
            const pubClient = new Redis(configService.redisUrl, {
                password: configService.redisPassword,
            });
            const subClient = pubClient.duplicate();
            this.redisAdapter = createAdapter(pubClient, subClient);
        }
    }
    afterInit(server) {
        if (this.redisAdapter) {
            server.adapter(this.redisAdapter);
        }
        this.logger.log('WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);
            await client.join(`user:${payload.sub}`);
            await client.join(`role:${payload.role}`);
        }
        catch (error) {
            this.logger.error(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleLocationUpdate(client, data) {
        const userId = client.data.userId;
        this.server.to('role:ADMIN').emit('agent:location', {
            agentId: userId,
            location: { lat: data.lat, lng: data.lng },
            timestamp: new Date().toISOString(),
        });
        client.volatile.emit('location:ack', {
            received: true,
            timestamp: new Date().toISOString(),
        });
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", typeof (_a = typeof Server !== "undefined" && Server) === "function" ? _a : Object)
], AppGateway.prototype, "server", void 0);
__decorate([
    UseGuards(WsAuthGuard),
    SubscribeMessage('location:update'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Socket !== "undefined" && Socket) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleLocationUpdate", null);
AppGateway = AppGateway_1 = __decorate([
    WebSocketGateway({
        cors: {
            origin: '*',
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __param(1, Inject('IJwtService')),
    __metadata("design:paramtypes", [ConfigService, Object])
], AppGateway);
export { AppGateway };
//# sourceMappingURL=websocket.gateway.js.map