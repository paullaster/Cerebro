import { CanActivate, ExecutionContext } from '@nestjs/common';
import { IJwtService } from '../../../domain/adapters/jwt.service.ts';
export declare class WsAuthGuard implements CanActivate {
    private readonly jwtService;
    constructor(jwtService: IJwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
