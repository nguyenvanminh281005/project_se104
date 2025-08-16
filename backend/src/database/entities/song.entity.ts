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

@Entity('songs')
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column({ nullable: true })
  album?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number; // Duration in seconds

  @Column()
  filePath: string; // Path to the audio file

  @Column({ nullable: true })
  coverImage?: string; // Path to cover image

  @Column({ type: 'text', nullable: true })
  lyrics?: string;

  @Column({ type: 'simple-array', nullable: true })
  genres?: string[];

  @Column({ type: 'int', default: 0 })
  playCount: number;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column('uuid', { nullable: true })
  uploadedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
