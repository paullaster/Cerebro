export interface IJwtService {
    sign(payload: any, options?: { expiresIn?: string }): string;
    verify(token: string): any;
    decode(token: string): any;
}