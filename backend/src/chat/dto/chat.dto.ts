import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { MessageType } from '../../database/entities/message.entity';
import { ConversationType } from '../../database/entities/conversation.entity';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsUUID()
  conversationId: string;
}

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @IsUUID('4', { each: true })
  participantIds: string[];
}
