import { IsString, IsEnum, IsOptional, IsObject, IsUUID } from 'class-validator';
import { CallType } from '../../database/entities/call.entity';

export class InitiateCallDto {
  @IsUUID()
  calleeId: string;

  @IsEnum(CallType)
  type: CallType;
}

export class CallSignalingDto {
  @IsUUID()
  callId: string;

  @IsOptional()
  @IsObject()
  offer?: any;

  @IsOptional()
  @IsObject()
  answer?: any;

  @IsOptional()
  @IsObject()
  iceCandidate?: any;
}

export class CallResponseDto {
  @IsUUID()
  callId: string;

  @IsString()
  action: 'accept' | 'reject';
}
