var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service.ts';
import { ConfigModule } from '../../config/config.module.ts';
import { JwtAdapter } from './jwt.service.ts';
import { RegisterFarmerUseCase } from '../../application/use-cases/auth/register-farmer.use-case.ts';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.ts';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/verify-otp.use-case.ts';
import { DatabaseModule } from '../database/database.module.ts';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Global(),
    Module({
        imports: [
            PassportModule,
            ConfigModule,
            DatabaseModule,
            JwtModule.registerAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.jwtSecret,
                    signOptions: { expiresIn: configService.jwtExpiration },
                }),
            }),
        ],
        providers: [
            {
                provide: 'IJwtService',
                useClass: JwtAdapter,
            },
            RegisterFarmerUseCase,
            LoginUseCase,
            VerifyOtpUseCase,
        ],
        exports: [
            'IJwtService',
            RegisterFarmerUseCase,
            LoginUseCase,
            VerifyOtpUseCase,
        ],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map