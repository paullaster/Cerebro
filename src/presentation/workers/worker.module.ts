import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [],
})
export class WorkerModule {}
