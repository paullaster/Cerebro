import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { WsAuthGuard } from '../middleware/guards/ws-auth.guard.ts';
import { ConfigService } from '../../config/config.service.ts';
import { IJwtService } from '../../domain/adapters/jwt.service.ts';

@WebSocketGateway({
  cors: {
    origin: '*', // Handled by App options usually, but specific for WS
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class AppGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private readonly redisAdapter: any;

  constructor(
    private readonly configService: ConfigService,
    @Inject('IJwtService') private readonly jwtService: IJwtService,
  ) {
    // Setup Redis adapter for cross-worker communication
    if (configService.isProduction || configService.clusterEnabled) {
      const pubClient = new Redis(configService.redisUrl, {
        password: configService.redisPassword,
      });
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
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Allow unauthenticated connection? PRD says "Reject unauthorized connections immediately" in 4.3
        // But typically handshake happens before connection fully established in socket.io middleware.
        // handleConnection is post-handshake.
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);

      // Join user-specific room
      await client.join(`user:${payload.sub}`);

      // Join role-specific room
      await client.join(`role:${payload.role}`);
    } catch (error) {
      this.logger.error(
        `Connection error: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('location:update')
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
