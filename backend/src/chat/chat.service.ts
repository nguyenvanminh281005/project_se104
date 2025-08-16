import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus } from '../database/entities/message.entity';
import { Conversation, ConversationType } from '../database/entities/conversation.entity';
import { User } from '../database/entities/user.entity';
import { CreateMessageDto, CreateConversationDto } from './dto/chat.dto';
import { ModerationService } from '../common/services/moderation.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private moderationService: ModerationService,
  ) {}

  async createConversation(
    createConversationDto: CreateConversationDto,
    userId: string,
  ): Promise<Conversation> {
    const { participantIds, name, type } = createConversationDto;

    // Add the creator to participants if not already included
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    // Validate participants exist
    const participants = await this.userRepository.findByIds(participantIds);
    if (participants.length !== participantIds.length) {
      throw new BadRequestException('Some participants do not exist');
    }

    // For direct conversations, check if one already exists
    if (type === ConversationType.DIRECT && participantIds.length === 2) {
      const existingConversation = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoin('conversation.participants', 'participant')
        .where('conversation.type = :type', { type: ConversationType.DIRECT })
        .groupBy('conversation.id')
        .having('COUNT(participant.id) = :count', { count: 2 })
        .andWhere('participant.id IN (:...participantIds)', { participantIds })
        .getOne();

      if (existingConversation) {
        return this.getConversationById(existingConversation.id, userId);
      }
    }

    const conversation = this.conversationRepository.create({
      name,
      type: type || ConversationType.DIRECT,
      participants,
    });

    await this.conversationRepository.save(conversation);
    return this.getConversationById(conversation.id, userId);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('participant.id = :userId', { userId })
      .orderBy('conversation.lastActivity', 'DESC')
      .getMany();
  }

  async getConversationById(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'messages', 'messages.sender'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return conversation;
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    userId: string,
    filePath?: string,
  ): Promise<Message> {
    const { content, type, conversationId } = createMessageDto;

    // Verify user is participant in conversation
    await this.getConversationById(conversationId, userId);

    // Create message
    const message = this.messageRepository.create({
      content,
      type,
      senderId: userId,
      conversationId,
      filePath,
      status: MessageStatus.PENDING,
    });

    // AI Moderation for text messages
    if (!type || type === 'text') {
      const moderationResult = await this.moderationService.moderateMessage(content);
      message.moderationResult = moderationResult;

      if (moderationResult.isFlagged) {
        message.status = MessageStatus.FLAGGED;
      } else {
        message.status = MessageStatus.SENT;
      }
    } else {
      message.status = MessageStatus.SENT;
    }

    await this.messageRepository.save(message);

    // Update conversation's last activity
    await this.conversationRepository.update(conversationId, {
      lastActivity: new Date(),
    });

    // Return message with sender info
    return this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    // Verify user is participant
    await this.getConversationById(conversationId, userId);

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
    };
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation', 'conversation.participants'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is participant
    const isParticipant = message.conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Only update if message is not from the same user
    if (message.senderId !== userId) {
      await this.messageRepository.update(messageId, {
        status: MessageStatus.READ,
      });
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.update(messageId, {
      isDeleted: true,
      content: 'This message was deleted',
    });
  }

  async searchMessages(
    query: string,
    userId: string,
    conversationId?: string,
  ): Promise<Message[]> {
    let queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.conversation', 'conversation')
      .leftJoin('conversation.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .andWhere('message.content ILIKE :query', { query: `%${query}%` })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false });

    if (conversationId) {
      queryBuilder = queryBuilder.andWhere('message.conversationId = :conversationId', {
        conversationId,
      });
    }

    return queryBuilder.orderBy('message.createdAt', 'DESC').take(100).getMany();
  }
}
