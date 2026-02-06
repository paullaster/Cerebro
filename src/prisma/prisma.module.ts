import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { RedisService } from './redis.service.js';
import { ConfigModule } from '../config/config.module.js';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class PrismaModule {}
