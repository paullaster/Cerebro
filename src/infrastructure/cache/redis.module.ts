import { Module, Global } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
// import { RedisService } from './redis.service'; // Implement later if needed

@Global()
@Module({
  providers: [],
  exports: [],
})
export class RedisModule {}
