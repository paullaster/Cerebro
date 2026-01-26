import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '../../config/config.service.ts';
import { ILogger } from '../../domain/adapters/logger.service.ts';
import { IRealTimeService } from '../../domain/adapters/real-time.service.ts';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, IRealTimeService {
    private readonly configService;
    private readonly domainLogger;
    server: Server;
    private readonly logger;
    private redisAdapter;
    private readonly userSocketMap;
    constructor(configService: ConfigService, domainLogger: ILogger);
    private setupRedisAdapter;
    afterInit(server: Server): void;
    private configureNamespaces;
    handleConnection(client: Socket): any;
    handleDisconnect(client: Socket): void;
    emitToUser(userId: string, event: string, payload: any): Promise<void>;
    emitToUsers(userIds: string[], event: string, payload: any): Promise<void>;
    emitToRoom(room: string, event: string, payload: any): Promise<void>;
    joinRoom(userId: string, room: string): Promise<void>;
    leaveRoom(userId: string, room: string): Promise<void>;
    broadcast(event: string, payload: any, options?: {
        volatile?: boolean;
        namespace?: string;
    }): Promise<void>;
    getUserRooms(userId: string): Promise<string[]>;
    getRoomUsers(room: string): Promise<string[]>;
    disconnectUser(userId: string): Promise<void>;
    handleNotificationAck(client: Socket, data: {
        notificationId: string;
    }): any;
    handleNotificationSubscribe(client: Socket, data: {
        topics: string[];
    }): any;
    private verifyToken;
    private handleNamespaceConnection;
}
