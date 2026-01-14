import { UUIDv7 } from '../value-objects/uuid-v7.value-object';

export interface RealTimeMessage {
    event: string;
    payload: any;
    volatile?: boolean; // For high-frequency, non-critical data
    room?: string;
}

export interface IRealTimeService {
    // User targeting
    emitToUser(userId: UUIDv7, event: string, payload: any): Promise<void>;
    emitToUsers(userIds: UUIDv7[], event: string, payload: any): Promise<void>;

    // Room targeting
    emitToRoom(room: string, event: string, payload: any): Promise<void>;
    joinRoom(userId: UUIDv7, room: string): Promise<void>;
    leaveRoom(userId: UUIDv7, room: string): Promise<void>;

    // Broadcast
    broadcast(event: string, payload: any, options?: {
        volatile?: boolean;
        namespace?: string;
    }): Promise<void>;

    // Presence
    getUserRooms(userId: UUIDv7): Promise<string[]>;
    getRoomUsers(room: string): Promise<UUIDv7[]>;

    // Connection management
    disconnectUser(userId: UUIDv7): Promise<void>;
}