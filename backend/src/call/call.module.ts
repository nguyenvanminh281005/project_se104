import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { CallGateway } from './call.gateway';
import { Call } from '../database/entities/call.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call, User]),
    AuthModule,
    CommonModule,
  ],
  controllers: [CallController],
  providers: [CallService, CallGateway],
  exports: [CallService, CallGateway],
})
export class CallModule {}
