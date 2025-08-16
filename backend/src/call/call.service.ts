import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus, CallType } from '../database/entities/call.entity';
import { User } from '../database/entities/user.entity';
import { InitiateCallDto, CallSignalingDto, CallResponseDto } from './dto/call.dto';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async initiateCall(initiateCallDto: InitiateCallDto, callerId: string): Promise<Call> {
    const { calleeId, type } = initiateCallDto;

    if (callerId === calleeId) {
      throw new BadRequestException('Cannot call yourself');
    }

    // Check if callee exists
    const callee = await this.userRepository.findOne({ where: { id: calleeId } });
    if (!callee) {
      throw new NotFoundException('User not found');
    }

    // Check if there's already an active call between these users
    const existingCall = await this.callRepository.findOne({
      where: [
        {
          callerId,
          calleeId,
          status: CallStatus.RINGING,
        },
        {
          callerId,
          calleeId,
          status: CallStatus.ANSWERED,
        },
        {
          callerId: calleeId,
          calleeId: callerId,
          status: CallStatus.RINGING,
        },
        {
          callerId: calleeId,
          calleeId: callerId,
          status: CallStatus.ANSWERED,
        },
      ],
    });

    if (existingCall) {
      throw new BadRequestException('There is already an active call between these users');
    }

    const call = this.callRepository.create({
      callerId,
      calleeId,
      type,
      status: CallStatus.INITIATING,
    });

    const savedCall = await this.callRepository.save(call);

    // Set status to ringing after saving
    savedCall.status = CallStatus.RINGING;
    await this.callRepository.save(savedCall);

    return this.getCallById(savedCall.id, callerId);
  }

  async getCallById(callId: string, userId: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['caller', 'callee'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Check if user is participant
    if (call.callerId !== userId && call.calleeId !== userId) {
      throw new ForbiddenException('You are not a participant in this call');
    }

    return call;
  }

  async respondToCall(callResponseDto: CallResponseDto, userId: string): Promise<Call> {
    const { callId, action } = callResponseDto;

    const call = await this.getCallById(callId, userId);

    // Only callee can respond
    if (call.calleeId !== userId) {
      throw new ForbiddenException('Only the callee can respond to the call');
    }

    // Call must be in ringing state
    if (call.status !== CallStatus.RINGING) {
      throw new BadRequestException('Call is not in ringing state');
    }

    if (action === 'accept') {
      call.status = CallStatus.ANSWERED;
      call.startedAt = new Date();
    } else if (action === 'reject') {
      call.status = CallStatus.REJECTED;
      call.endedAt = new Date();
    }

    await this.callRepository.save(call);
    return call;
  }

  async endCall(callId: string, userId: string): Promise<Call> {
    const call = await this.getCallById(callId, userId);

    // Can only end active calls
    if (call.status !== CallStatus.ANSWERED && call.status !== CallStatus.RINGING) {
      throw new BadRequestException('Call is not active');
    }

    call.status = CallStatus.ENDED;
    call.endedAt = new Date();

    // Calculate duration if call was answered
    if (call.startedAt) {
      call.duration = Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000);
    }

    await this.callRepository.save(call);
    return call;
  }

  async updateSignaling(callSignalingDto: CallSignalingDto, userId: string): Promise<Call> {
    const { callId, offer, answer, iceCandidate } = callSignalingDto;

    const call = await this.getCallById(callId, userId);

    // Initialize signaling object if it doesn't exist
    if (!call.signaling) {
      call.signaling = {};
    }

    // Update signaling data
    if (offer) {
      call.signaling.offer = offer;
    }
    if (answer) {
      call.signaling.answer = answer;
    }
    if (iceCandidate) {
      if (!call.signaling.iceCandidates) {
        call.signaling.iceCandidates = [];
      }
      call.signaling.iceCandidates.push(iceCandidate);
    }

    await this.callRepository.save(call);
    return call;
  }

  async getUserCallHistory(userId: string, page: number = 1, limit: number = 20): Promise<{
    calls: Call[];
    total: number;
  }> {
    const [calls, total] = await this.callRepository.findAndCount({
      where: [{ callerId: userId }, { calleeId: userId }],
      relations: ['caller', 'callee'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { calls, total };
  }

  async getActiveCall(userId: string): Promise<Call | null> {
    const call = await this.callRepository.findOne({
      where: [
        {
          callerId: userId,
          status: CallStatus.RINGING,
        },
        {
          callerId: userId,
          status: CallStatus.ANSWERED,
        },
        {
          calleeId: userId,
          status: CallStatus.RINGING,
        },
        {
          calleeId: userId,
          status: CallStatus.ANSWERED,
        },
      ],
      relations: ['caller', 'callee'],
    });

    return call;
  }

  async markCallAsMissed(callId: string): Promise<void> {
    await this.callRepository.update(callId, {
      status: CallStatus.MISSED,
      endedAt: new Date(),
    });
  }

  async autoCallTimeout(callId: string): Promise<void> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    
    if (call && call.status === CallStatus.RINGING) {
      await this.markCallAsMissed(callId);
      
      // Here you could implement auto-call logic
      // For example, automatically call again after a delay
    }
  }
}
