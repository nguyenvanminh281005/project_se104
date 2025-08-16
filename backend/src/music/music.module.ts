import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { Song } from '../database/entities/song.entity';
import { Playlist } from '../database/entities/playlist.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Song, Playlist, User])],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}
