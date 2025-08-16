import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MusicModule } from './music/music.module';
import { ChatModule } from './chat/chat.module';
import { CallModule } from './call/call.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration module - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database module
    DatabaseModule,

    // Common module
    CommonModule,

    // Feature modules
    AuthModule,
    MusicModule,
    ChatModule,
    CallModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
