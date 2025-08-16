import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { CallService } from './call.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';
import { InitiateCallDto, CallResponseDto } from './dto/call.dto';

@Controller('call')
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(private callService: CallService) {}

  @Post('initiate')
  async initiateCall(@Body() initiateCallDto: InitiateCallDto, @GetUser() user: User) {
    return this.callService.initiateCall(initiateCallDto, user.id);
  }

  @Get('history')
  async getCallHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @GetUser() user: User,
  ) {
    return this.callService.getUserCallHistory(user.id, page, limit);
  }

  @Get('active')
  async getActiveCall(@GetUser() user: User) {
    return this.callService.getActiveCall(user.id);
  }

  @Get(':id')
  async getCallById(@Param('id') id: string, @GetUser() user: User) {
    return this.callService.getCallById(id, user.id);
  }

  @Post(':id/respond')
  async respondToCall(
    @Param('id') id: string,
    @Body() callResponseDto: CallResponseDto,
    @GetUser() user: User,
  ) {
    return this.callService.respondToCall({ ...callResponseDto, callId: id }, user.id);
  }

  @Post(':id/end')
  async endCall(@Param('id') id: string, @GetUser() user: User) {
    return this.callService.endCall(id, user.id);
  }
}
