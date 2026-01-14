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
import { Logger, UseGuards } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { WsAuthGuard } from '../middleware/guards/ws-auth.guard';
import { ConfigService } from '../../config/config.service';

@WebSocketGateway({
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
    namespace: '/',
    transports: ['websocket', 'polling'],
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(WebSocketGateway.name);
    private readonly redisAdapter: any;

    constructor(private readonly configService: ConfigService) {
        // Setup Redis adapter for cross-worker communication
        if (configService.isProduction) {
            const pubClient = new Redis(configService.redisUrl);
            const subClient = pubClient.duplicate();
            this.redisAdapter = createAdapter(pubClient, subClient);
        }
    }

    afterInit(server: Server) {
        if (this.redisAdapter) {
            server.adapter(this.redisAdapter);
        }

        this.logger.log('WebSocket Gateway initialized');
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                client.disconnect();
                return;
            }

            // Verify JWT token
            // Implementation would use JWT service
            // const payload = await this.jwtService.verify(token);
            // client.data.userId = payload.sub;
            // client.data.role = payload.role;

            this.logger.log(`Client connected: ${client.id}`);

            // Join user-specific room
            client.join(`user:${client.data.userId}`);

            // Join role-specific room
            client.join(`role:${client.data.role}`);
        } catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('collection:verify')
    async handleCollectionVerification(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { collectionId: string; notes?: string },
    ) {
        const userId = client.data.userId;

        // Emit to all admins
        this.server.to('role:ADMIN').emit('collection:verified', {
            collectionId: data.collectionId,
            verifiedBy: userId,
            timestamp: new Date().toISOString(),
        });

        // Emit to specific farmer
        // This would require fetching the farmer ID from the collection
        // this.server.to(`user:${farmerId}`).emit('collection:status-updated', {
        //   collectionId: data.collectionId,
        //   status: 'VERIFIED',
        // });
    }

    @SubscribeMessage('location:update')
    @UseGuards(WsAuthGuard)
    async handleLocationUpdate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { lat: number; lng: number; accuracy?: number },
    ) {
        const userId = client.data.userId;

        // Broadcast to admin dashboard
        this.server.to('role:ADMIN').emit('agent:location', {
            agentId: userId,
            location: { lat: data.lat, lng: data.lng },
            timestamp: new Date().toISOString(),
        });

        // Volatile emit for high-frequency updates
        client.volatile.emit('location:ack', {
            received: true,
            timestamp: new Date().toISOString(),
        });
    }
}