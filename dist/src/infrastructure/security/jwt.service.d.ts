import { ConfigService } from '../../config/config.service.ts';
import { IJwtService } from '../../domain/adapters/jwt.service.ts';
export declare class JwtAdapter implements IJwtService {
    private readonly configService;
    constructor(configService: ConfigService);
    sign(payload: any, options?: {
        expiresIn?: string;
    }): string;
    verify(token: string): any;
    decode(token: string): any;
}
