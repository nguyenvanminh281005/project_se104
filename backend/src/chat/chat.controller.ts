import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';
import { CreateMessageDto, CreateConversationDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @GetUser() user: User,
  ) {
    return this.chatService.createConversation(createConversationDto, user.id);
  }

  @Get('conversations')
  async getUserConversations(@GetUser() user: User) {
    return this.chatService.getUserConversations(user.id);
  }

  @Get('conversations/:id')
  async getConversationById(@Param('id') id: string, @GetUser() user: User) {
    return this.chatService.getConversationById(id, user.id);
  }

  @Get('conversations/:id/messages')
  async getConversationMessages(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @GetUser() user: User,
  ) {
    return this.chatService.getConversationMessages(id, user.id, page, limit);
  }

  @Post('messages')
  async createMessage(@Body() createMessageDto: CreateMessageDto, @GetUser() user: User) {
    return this.chatService.createMessage(createMessageDto, user.id);
  }

  @Post('messages/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow images, audio, and documents
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'audio/mpeg',
          'audio/wav',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadMessageFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMessageDto: CreateMessageDto,
    @GetUser() user: User,
  ) {
    const messageType = file.mimetype.startsWith('image/') ? 'image' : 
                       file.mimetype.startsWith('audio/') ? 'audio' : 'file';
    
    return this.chatService.createMessage(
      { ...createMessageDto, type: messageType as any },
      user.id,
      file.path,
    );
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string, @GetUser() user: User) {
    await this.chatService.deleteMessage(id, user.id);
    return { message: 'Message deleted successfully' };
  }

  @Post('messages/:id/read')
  async markMessageAsRead(@Param('id') id: string, @GetUser() user: User) {
    await this.chatService.markMessageAsRead(id, user.id);
    return { message: 'Message marked as read' };
  }

  @Get('search')
  async searchMessages(
    @Query('q') query: string,
    @GetUser() user: User,
    @Query('conversationId') conversationId?: string,
  ) {
    return this.chatService.searchMessages(query, user.id, conversationId);
  }
}
