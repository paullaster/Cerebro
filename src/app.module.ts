import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from './config/config.module.js';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
      },
      {
        path: 'users',
        module: UsersModule,
      },
    ]),
    UsersModule,
    AuthModule,
    PrismaModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
