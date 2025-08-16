import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum CallStatus {
  INITIATING = 'initiating',
  RINGING = 'ringing',
  ANSWERED = 'answered',
  ENDED = 'ended',
  MISSED = 'missed',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CallType,
    default: CallType.AUDIO,
  })
  type: CallType;

  @Column({
    type: 'enum',
    enum: CallStatus,
    default: CallStatus.INITIATING,
  })
  status: CallStatus;

  @Column({ type: 'int', nullable: true })
  duration?: number; // Duration in seconds

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'json', nullable: true })
  signaling?: {
    offer?: any;
    answer?: any;
    iceCandidates?: any[];
  };

  @Column('uuid')
  callerId: string;

  @Column('uuid')
  calleeId: string;

  @ManyToOne(() => User, (user) => user.initiatedCalls)
  @JoinColumn({ name: 'callerId' })
  caller: User;

  @ManyToOne(() => User, (user) => user.receivedCalls)
  @JoinColumn({ name: 'calleeId' })
  callee: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
