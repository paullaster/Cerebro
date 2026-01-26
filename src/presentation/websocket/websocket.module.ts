import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module.ts';
import { AuthModule } from '../../infrastructure/security/auth.module.ts'; // for WsAuthGuard / JwtService
import { AppGateway } from './websocket.gateway.ts';
import { SocketIoRealTimeAdapter } from '../../infrastructure/adapters/socket-io-real-time.adapter.ts';

@Global()
@Module({
  imports: [ConfigModule, AuthModule],
  providers: [
    AppGateway,
    {
      provide: 'IRealTimeService',
      useClass: SocketIoRealTimeAdapter,
    },
  ],
  exports: [AppGateway, 'IRealTimeService'],
})
export class WebSocketModule {}
