var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { AppGateway } from '../../presentation/websocket/websocket.gateway.ts';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.value-object.ts';
let SocketIoRealTimeAdapter = class SocketIoRealTimeAdapter {
    gateway;
    constructor(gateway) {
        this.gateway = gateway;
    }
    async emitToUser(userId, event, payload) {
        this.gateway.server.to(`user:${userId.toString()}`).emit(event, payload);
    }
    async emitToUsers(userIds, event, payload) {
        for (const userId of userIds) {
            this.gateway.server.to(`user:${userId.toString()}`).emit(event, payload);
        }
    }
    async emitToRoom(room, event, payload) {
        this.gateway.server.to(room).emit(event, payload);
    }
    async joinRoom(userId, room) {
        const sockets = await this.gateway.server
            .in(`user:${userId.toString()}`)
            .fetchSockets();
        for (const socket of sockets) {
            socket.join(room);
        }
    }
    async leaveRoom(userId, room) {
        const sockets = await this.gateway.server
            .in(`user:${userId.toString()}`)
            .fetchSockets();
        for (const socket of sockets) {
            socket.leave(room);
        }
    }
    async broadcast(event, payload, options) {
        if (options?.volatile) {
            this.gateway.server.volatile.emit(event, payload);
        }
        else {
            this.gateway.server.emit(event, payload);
        }
    }
    async getUserRooms(userId) {
        const sockets = await this.gateway.server
            .in(`user:${userId.toString()}`)
            .fetchSockets();
        if (sockets.length === 0)
            return [];
        const rooms = new Set();
        for (const socket of sockets) {
            for (const room of socket.rooms) {
                rooms.add(room);
            }
        }
        return Array.from(rooms);
    }
    async getRoomUsers(room) {
        const sockets = await this.gateway.server.in(room).fetchSockets();
        const userIds = new Set();
        for (const socket of sockets) {
            if (socket.data.userId) {
                userIds.add(socket.data.userId);
            }
        }
        return Array.from(userIds).map((id) => new UUIDv7(id));
    }
    async disconnectUser(userId) {
        this.gateway.server.in(`user:${userId.toString()}`).disconnectSockets(true);
    }
};
SocketIoRealTimeAdapter = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AppGateway])
], SocketIoRealTimeAdapter);
export { SocketIoRealTimeAdapter };
//# sourceMappingURL=socket-io-real-time.adapter.js.map