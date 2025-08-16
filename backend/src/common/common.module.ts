import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { ModerationService } from './services/moderation.service';

@Module({
  providers: [RedisService, ModerationService],
  exports: [RedisService, ModerationService],
})
export class CommonModule {}
