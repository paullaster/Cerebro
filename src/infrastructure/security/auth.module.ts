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

@Global()
@Module({
  imports: [
    PassportModule,
    ConfigModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
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
export class AuthModule {}
