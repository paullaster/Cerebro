import { Injectable } from '@nestjs/common';
import { IRealTimeService } from '../../domain/adapters/real-time.service.ts';
import { AppGateway } from '../../presentation/websocket/websocket.gateway.ts';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.value-object.ts';

@Injectable()
export class SocketIoRealTimeAdapter implements IRealTimeService {
  constructor(private readonly gateway: AppGateway) {}

  async emitToUser(userId: UUIDv7, event: string, payload: any): Promise<void> {
    this.gateway.server.to(`user:${userId.toString()}`).emit(event, payload);
  }

  async emitToUsers(
    userIds: UUIDv7[],
    event: string,
    payload: any,
  ): Promise<void> {
    // Optimization: if list is large, might be better to iterate or use room if they share one.
    // For strictness, loop.
    for (const userId of userIds) {
      this.gateway.server.to(`user:${userId.toString()}`).emit(event, payload);
    }
  }

  async emitToRoom(room: string, event: string, payload: any): Promise<void> {
    this.gateway.server.to(room).emit(event, payload);
  }

  async joinRoom(userId: UUIDv7, room: string): Promise<void> {
    // Socket.io standard way to join room is from the socket instance.
    // Since we don't have direct access to socket here (it's async service),
    // we can target all sockets of this user to join a room.
    const sockets = await this.gateway.server
      .in(`user:${userId.toString()}`)
      .fetchSockets();
    for (const socket of sockets) {
      socket.join(room);
    }
  }

  async leaveRoom(userId: UUIDv7, room: string): Promise<void> {
    const sockets = await this.gateway.server
      .in(`user:${userId.toString()}`)
      .fetchSockets();
    for (const socket of sockets) {
      socket.leave(room);
    }
  }

  async broadcast(
    event: string,
    payload: any,
    options?: { volatile?: boolean; namespace?: string },
  ): Promise<void> {
    if (options?.volatile) {
      this.gateway.server.volatile.emit(event, payload);
    } else {
      this.gateway.server.emit(event, payload);
    }
  }

  async getUserRooms(userId: UUIDv7): Promise<string[]> {
    // Fetch sockets for user
    const sockets = await this.gateway.server
      .in(`user:${userId.toString()}`)
      .fetchSockets();
    if (sockets.length === 0) return [];
    // Union of rooms
    const rooms = new Set<string>();
    for (const socket of sockets) {
      for (const room of socket.rooms) {
        rooms.add(room);
      }
    }
    return Array.from(rooms);
  }

  async getRoomUsers(room: string): Promise<UUIDv7[]> {
    // This is expensive in distributed setup without proper tracking.
    // With redis adapter, fetchSockets works.
    const sockets = await this.gateway.server.in(room).fetchSockets();
    const userIds = new Set<string>();
    for (const socket of sockets) {
      if (socket.data.userId) {
        userIds.add(socket.data.userId);
      }
    }
    return Array.from(userIds).map((id) => new UUIDv7(id));
  }

  async disconnectUser(userId: UUIDv7): Promise<void> {
    this.gateway.server.in(`user:${userId.toString()}`).disconnectSockets(true);
  }
}
