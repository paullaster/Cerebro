import { IRealTimeService } from '../../domain/adapters/real-time.service.ts';
import { AppGateway } from '../../presentation/websocket/websocket.gateway.ts';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.value-object.ts';
export declare class SocketIoRealTimeAdapter implements IRealTimeService {
    private readonly gateway;
    constructor(gateway: AppGateway);
    emitToUser(userId: UUIDv7, event: string, payload: any): Promise<void>;
    emitToUsers(userIds: UUIDv7[], event: string, payload: any): Promise<void>;
    emitToRoom(room: string, event: string, payload: any): Promise<void>;
    joinRoom(userId: UUIDv7, room: string): Promise<void>;
    leaveRoom(userId: UUIDv7, room: string): Promise<void>;
    broadcast(event: string, payload: any, options?: {
        volatile?: boolean;
        namespace?: string;
    }): Promise<void>;
    getUserRooms(userId: UUIDv7): Promise<string[]>;
    getRoomUsers(room: string): Promise<UUIDv7[]>;
    disconnectUser(userId: UUIDv7): Promise<void>;
}
