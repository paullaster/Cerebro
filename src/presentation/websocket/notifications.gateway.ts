import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { WsAuthGuard } from '../middleware/guards/ws-auth.guard';
import { ConfigService } from '../../config/config.service';
import { ILogger } from '../../domain/adapters/logger.service';
import { IRealTimeService } from '../../domain/adapters/real-time.service';

@WebSocketGateway({
    namespace: 'notifications',
    cors: {
        origin: (origin, callback) => {
            const configService = new ConfigService();
            if (configService.frontendUrls.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    // High-performance settings
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e8, // 100MB for file transfers
    allowEIO3: true,
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, IRealTimeService {
    @WebSocketServer()
    server: Server;

    private readonly logger: Logger = new Logger(NotificationsGateway.name);
    private redisAdapter: any;
    private readonly userSocketMap = new Map<string, string>(); // userId -> socketId

    constructor(
        private readonly configService: ConfigService,
        @Inject('ILogger') private readonly domainLogger: ILogger,
    ) {
        this.setupRedisAdapter();
    }

    private setupRedisAdapter(): void {
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

    afterInit(server: Server) {
        if (this.redisAdapter) {
            server.adapter(this.redisAdapter);
            this.logger.log('Redis adapter configured for cluster support');
        }

        // Configure namespaces
        this.configureNamespaces();

        this.logger.log('Notifications WebSocket Gateway initialized');
    }

    private configureNamespaces(): void {
        // Create separate namespaces for different notification types
        const adminNamespace = this.server.of('/admin');
        const agentNamespace = this.server.of('/agent');
        const farmerNamespace = this.server.of('/farmer');

        // Setup auth and handlers for each namespace
        [adminNamespace, agentNamespace, farmerNamespace].forEach((namespace) => {
            namespace.use((socket, next) => {
                // Authentication middleware
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                // Verify token and attach user data
                socket.data.user = this.verifyToken(token);
                next();
            });

            namespace.on('connection', (socket) => {
                this.handleNamespaceConnection(socket, namespace.name);
            });
        });
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                client.disconnect();
                return;
            }

            // Verify JWT
            const user = await this.verifyToken(token);
            if (!user) {
                client.disconnect();
                return;
            }

            // Store socket mapping
            client.data.user = user;
            this.userSocketMap.set(user.id, client.id);

            // Join user-specific room
            client.join(`user:${user.id}`);

            // Join role-specific room
            client.join(`role:${user.role}`);

            // Join regional room if agent
            if (user.role === 'AGENT' && user.region) {
                client.join(`region:${user.region}`);
            }

            this.domainLogger.info(
                'NotificationsGateway',
                'Client connected',
                {
                    socketId: client.id,
                    userId: user.id,
                    role: user.role,
                    namespace: client.nsp.name,
                }
            );

            // Send connection confirmation
            client.emit('connected', {
                serverTime: new Date().toISOString(),
                userId: user.id,
            });
        } catch (error) {
            this.domainLogger.error('NotificationsGateway', 'Connection error', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const user = client.data.user;
        if (user) {
            this.userSocketMap.delete(user.id);

            this.domainLogger.info(
                'NotificationsGateway',
                'Client disconnected',
                {
                    socketId: client.id,
                    userId: user.id,
                    duration: Date.now() - client.data.connectedAt,
                }
            );
        }
    }

    // IRealTimeService implementation
    async emitToUser(userId: string, event: string, payload: any): Promise<void> {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.emit(event, payload);
            }
        }

        // Also emit to user room for cluster compatibility
        this.server.to(`user:${userId}`).emit(event, payload);
    }

    async emitToUsers(userIds: string[], event: string, payload: any): Promise<void> {
        userIds.forEach(userId => {
            this.emitToUser(userId, event, payload);
        });
    }

    async emitToRoom(room: string, event: string, payload: any): Promise<void> {
        this.server.to(room).emit(event, payload);
    }

    async joinRoom(userId: string, room: string): Promise<void> {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.join(room);
            }
        }
    }

    async leaveRoom(userId: string, room: string): Promise<void> {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.leave(room);
            }
        }
    }

    async broadcast(event: string, payload: any, options?: {
        volatile?: boolean;
        namespace?: string;
    }): Promise<void> {
        const namespace = options?.namespace
            ? this.server.of(options.namespace)
            : this.server;

        if (options?.volatile) {
            namespace.volatile.emit(event, payload);
        } else {
            namespace.emit(event, payload);
        }
    }

    async getUserRooms(userId: string): Promise<string[]> {
        const socketId = this.userSocketMap.get(userId);
        if (!socketId) return [];

        const socket = this.server.sockets.sockets.get(socketId);
        return Array.from(socket.rooms);
    }

    async getRoomUsers(room: string): Promise<string[]> {
        const roomSockets = this.server.sockets.adapter.rooms.get(room);
        if (!roomSockets) return [];

        return Array.from(roomSockets).map(socketId => {
            const socket = this.server.sockets.sockets.get(socketId);
            return socket?.data.user?.id;
        }).filter(Boolean);
    }

    async disconnectUser(userId: string): Promise<void> {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket) {
                socket.disconnect();
            }
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('notification:ack')
    async handleNotificationAck(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { notificationId: string },
    ) {
        const user = client.data.user;

        this.domainLogger.debug(
            'NotificationsGateway',
            'Notification acknowledged',
            {
                userId: user.id,
                notificationId: data.notificationId,
                socketId: client.id,
            }
        );

        // Mark notification as read in database
        // await this.notificationService.markAsRead(data.notificationId, user.id);

        client.emit('notification:ack:confirmed', {
            notificationId: data.notificationId,
            timestamp: new Date().toISOString(),
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('notification:subscribe')
    async handleNotificationSubscribe(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { topics: string[] },
    ) {
        const user = client.data.user;

        data.topics.forEach(topic => {
            client.join(`topic:${topic}`);
        });

        this.domainLogger.info(
            'NotificationsGateway',
            'User subscribed to topics',
            {
                userId: user.id,
                topics: data.topics,
            }
        );
    }

    private async verifyToken(token: string): Promise<any> {
        // JWT verification logic
        // This would use your auth service
        try {
            // const payload = await this.authService.verifyToken(token);
            // return payload;
            return { id: 'user-id', role: 'USER' }; // Mock
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    private handleNamespaceConnection(socket: Socket, namespace: string): void {
        socket.data.connectedAt = Date.now();
        socket.data.namespace = namespace;

        this.domainLogger.debug(
            'NotificationsGateway',
            'Namespace connection',
            {
                namespace,
                socketId: socket.id,
                userId: socket.data.user?.id,
            }
        );
    }
}