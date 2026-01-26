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
var NotificationsGateway_1;
var _a, _b, _c;
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { WsAuthGuard } from '../middleware/guards/ws-auth.guard.ts';
import { ConfigService } from '../../config/config.service.ts';
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    configService;
    domainLogger;
    server;
    logger = new Logger(NotificationsGateway_1.name);
    redisAdapter;
    userSocketMap = new Map();
    constructor(configService, domainLogger) {
        this.configService = configService;
        this.domainLogger = domainLogger;
        this.setupRedisAdapter();
    }
    setupRedisAdapter() {
        if (this.configService.isProduction) {
            const pubClient = new Redis(this.configService.redisUrl, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 100, 3000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
            });
            const subClient = pubClient.duplicate();
            this.redisAdapter = createAdapter(pubClient, subClient, {
                requestsTimeout: 5000,
            });
        }
    }
    afterInit(server) {
        if (this.redisAdapter) {
            server.adapter(this.redisAdapter);
            this.logger.log('Redis adapter configured for cluster support');
        }
        this.configureNamespaces();
        this.logger.log('Notifications WebSocket Gateway initialized');
    }
    configureNamespaces() {
        const adminNamespace = this.server.of('/admin');
        const agentNamespace = this.server.of('/agent');
        const farmerNamespace = this.server.of('/farmer');
        [adminNamespace, agentNamespace, farmerNamespace].forEach((namespace) => {
            namespace.use((socket, next) => {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                socket.data.user = this.verifyToken(token);
                next();
            });
            namespace.on('connection', (socket) => {
                this.handleNamespaceConnection(socket, namespace.name);
            });
        });
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const user = await this.verifyToken(token);
            if (!user) {
                client.disconnect();
                return;
            }
            client.data.user = user;
            this.userSocketMap.set(user.id, client.id);
            client.join(`user:${user.id}`);
            client.join(`role:${user.role}`);
            if (user.role === 'AGENT' && user.region) {
                client.join(`region:${user.region}`);
            }
            this.domainLogger.info('NotificationsGateway', 'Client connected', {
                socketId: client.id,
                userId: user.id,
                role: user.role,
                namespace: client.nsp.name,
            });
            client.emit('connected', {
                serverTime: new Date().toISOString(),
                userId: user.id,
            });
        }
        catch (error) {
            this.domainLogger.error('NotificationsGateway', 'Connection error', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const user = client.data.user;
        if (user) {
            this.userSocketMap.delete(user.id);
            this.domainLogger.info('NotificationsGateway', 'Client disconnected', {
                socketId: client.id,
                userId: user.id,
                duration: Date.now() - client.data.connectedAt,
            });
        }
    }
    async emitToUser(userId, event, payload) {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.emit(event, payload);
            }
        }
        this.server.to(`user:${userId}`).emit(event, payload);
    }
    async emitToUsers(userIds, event, payload) {
        userIds.forEach((userId) => {
            this.emitToUser(userId, event, payload);
        });
    }
    async emitToRoom(room, event, payload) {
        this.server.to(room).emit(event, payload);
    }
    async joinRoom(userId, room) {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.join(room);
            }
        }
    }
    async leaveRoom(userId, room) {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.leave(room);
            }
        }
    }
    async broadcast(event, payload, options) {
        const namespace = options?.namespace
            ? this.server.of(options.namespace)
            : this.server;
        if (options?.volatile) {
            namespace.volatile.emit(event, payload);
        }
        else {
            namespace.emit(event, payload);
        }
    }
    async getUserRooms(userId) {
        const socketId = this.userSocketMap.get(userId);
        if (!socketId)
            return [];
        const socket = this.server.sockets.sockets.get(socketId);
        return Array.from(socket.rooms);
    }
    async getRoomUsers(room) {
        const roomSockets = this.server.sockets.adapter.rooms.get(room);
        if (!roomSockets)
            return [];
        return Array.from(roomSockets)
            .map((socketId) => {
            const socket = this.server.sockets.sockets.get(socketId);
            return socket?.data.user?.id;
        })
            .filter(Boolean);
    }
    async disconnectUser(userId) {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.disconnect();
            }
        }
    }
    async handleNotificationAck(client, data) {
        const user = client.data.user;
        this.domainLogger.debug('NotificationsGateway', 'Notification acknowledged', {
            userId: user.id,
            notificationId: data.notificationId,
            socketId: client.id,
        });
        client.emit('notification:ack:confirmed', {
            notificationId: data.notificationId,
            timestamp: new Date().toISOString(),
        });
    }
    async handleNotificationSubscribe(client, data) {
        const user = client.data.user;
        data.topics.forEach((topic) => {
            client.join(`topic:${topic}`);
        });
        this.domainLogger.info('NotificationsGateway', 'User subscribed to topics', {
            userId: user.id,
            topics: data.topics,
        });
    }
    async verifyToken(token) {
        try {
            return { id: 'user-id', role: 'USER' };
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    handleNamespaceConnection(socket, namespace) {
        socket.data.connectedAt = Date.now();
        socket.data.namespace = namespace;
        this.domainLogger.debug('NotificationsGateway', 'Namespace connection', {
            namespace,
            socketId: socket.id,
            userId: socket.data.user?.id,
        });
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", typeof (_a = typeof Server !== "undefined" && Server) === "function" ? _a : Object)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    UseGuards(WsAuthGuard),
    SubscribeMessage('notification:ack'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Socket !== "undefined" && Socket) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleNotificationAck", null);
__decorate([
    UseGuards(WsAuthGuard),
    SubscribeMessage('notification:subscribe'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof Socket !== "undefined" && Socket) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleNotificationSubscribe", null);
NotificationsGateway = NotificationsGateway_1 = __decorate([
    WebSocketGateway({
        namespace: 'notifications',
        cors: {
            origin: (origin, callback) => {
                const configService = new ConfigService();
                if (configService.frontendUrls.includes(origin) || !origin) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
        maxHttpBufferSize: 1e8,
        allowEIO3: true,
    }),
    __param(1, Inject('ILogger')),
    __metadata("design:paramtypes", [ConfigService, Object])
], NotificationsGateway);
export { NotificationsGateway };
//# sourceMappingURL=notifications.gateway.js.map