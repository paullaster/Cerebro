import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { IJwtService } from '../../../domain/adapters/jwt.service.ts';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(
        @Inject('IJwtService') private readonly jwtService: IJwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient();
        const token = client.handshake.auth.token ||
            client.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new WsException('Unauthorized');
        }

        try {
            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            return true;
        } catch (error) {
            throw new WsException('Unauthorized');
        }
    }
}