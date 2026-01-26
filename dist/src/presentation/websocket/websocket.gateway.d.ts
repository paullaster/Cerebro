import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '../../config/config.service.ts';
import { IJwtService } from '../../domain/adapters/jwt.service.ts';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly configService;
    private readonly jwtService;
    server: Server;
    private readonly logger;
    private readonly redisAdapter;
    constructor(configService: ConfigService, jwtService: IJwtService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): any;
    handleDisconnect(client: Socket): void;
    handleLocationUpdate(client: Socket, data: {
        lat: number;
        lng: number;
        accuracy?: number;
    }): any;
}
