import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Song } from './song.entity';

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  coverImage?: string;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column('uuid')
  ownerId: string;

  @ManyToOne(() => User, (user) => user.playlists)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToMany(() => Song)
  @JoinTable({
    name: 'playlist_songs',
    joinColumn: { name: 'playlistId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'songId', referencedColumnName: 'id' },
  })
  songs: Song[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
