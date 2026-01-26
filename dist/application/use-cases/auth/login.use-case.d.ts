import { BaseUseCase } from '../../core/base.use-case.ts';
import { ILogger } from '../../../domain/adapters/logger.service.ts';
import { IUserRepository } from '../../../domain/repositories/user.repository.ts';
import { IJwtService } from '../../../domain/adapters/jwt.service.ts';
export interface LoginInput {
    email: string;
    password: string;
}
export interface LoginOutput {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class LoginUseCase extends BaseUseCase<LoginInput, LoginOutput> {
    protected readonly logger: ILogger;
    private readonly userRepository;
    private readonly jwtService;
    constructor(logger: ILogger, userRepository: IUserRepository, jwtService: IJwtService);
    validate(input: LoginInput): Promise<void>;
    execute(input: LoginInput): Promise<LoginOutput>;
    private dummyCompare;
}
