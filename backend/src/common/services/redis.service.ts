import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      socket: {
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
      },
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async setUserOnline(userId: string): Promise<void> {
    await this.set(`user:${userId}:status`, 'online', 86400); // 24 hours TTL
    await this.set(`user:${userId}:lastSeen`, new Date().toISOString());
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.set(`user:${userId}:status`, 'offline');
    await this.set(`user:${userId}:lastSeen`, new Date().toISOString());
  }

  async getUserStatus(userId: string): Promise<string | null> {
    return await this.get(`user:${userId}:status`);
  }

  async getUserLastSeen(userId: string): Promise<string | null> {
    return await this.get(`user:${userId}:lastSeen`);
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
