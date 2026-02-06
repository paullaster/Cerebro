import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '../config/config.service.js';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const connectionString = configService.databaseUrl;
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
