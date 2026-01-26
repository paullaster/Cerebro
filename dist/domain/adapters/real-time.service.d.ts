import { UUIDv7 } from '../value-objects/uuid-v7.value-object.ts';
export interface RealTimeMessage {
    event: string;
    payload: any;
    volatile?: boolean;
    room?: string;
}
export interface IRealTimeService {
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
