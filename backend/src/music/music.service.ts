import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from '../database/entities/song.entity';
import { Playlist } from '../database/entities/playlist.entity';
import { User } from '../database/entities/user.entity';
import {
  CreateSongDto,
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddSongToPlaylistDto,
} from './dto/music.dto';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Song methods
  async createSong(createSongDto: CreateSongDto, filePath: string, userId?: string): Promise<Song> {
    const song = this.songRepository.create({
      ...createSongDto,
      filePath,
      uploadedById: userId,
    });

    return this.songRepository.save(song);
  }

  async getAllSongs(): Promise<Song[]> {
    return this.songRepository.find({
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSongById(id: string): Promise<Song> {
    const song = await this.songRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    return song;
  }

  async getSongsByGenre(genre: string): Promise<Song[]> {
    return this.songRepository
      .createQueryBuilder('song')
      .where(':genre = ANY(song.genres)', { genre })
      .getMany();
  }

  async searchSongs(query: string): Promise<Song[]> {
    return this.songRepository
      .createQueryBuilder('song')
      .where('song.title ILIKE :query OR song.artist ILIKE :query OR song.album ILIKE :query', {
        query: `%${query}%`,
      })
      .getMany();
  }

  async incrementPlayCount(songId: string): Promise<void> {
    await this.songRepository.increment({ id: songId }, 'playCount', 1);
  }

  async likeSong(songId: string): Promise<void> {
    await this.songRepository.increment({ id: songId }, 'likes', 1);
  }

  async deleteSong(id: string, userId: string): Promise<void> {
    const song = await this.getSongById(id);

    if (song.uploadedById !== userId) {
      throw new ForbiddenException('You can only delete your own songs');
    }

    await this.songRepository.delete(id);
  }

  // Playlist methods
  async createPlaylist(createPlaylistDto: CreatePlaylistDto, userId: string): Promise<Playlist> {
    const playlist = this.playlistRepository.create({
      ...createPlaylistDto,
      ownerId: userId,
    });

    return this.playlistRepository.save(playlist);
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return this.playlistRepository.find({
      where: { ownerId: userId },
      relations: ['songs', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPublicPlaylists(): Promise<Playlist[]> {
    return this.playlistRepository.find({
      where: { isPublic: true },
      relations: ['songs', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPlaylistById(id: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['songs', 'owner'],
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return playlist;
  }

  async updatePlaylist(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.getPlaylistById(id);

    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own playlists');
    }

    await this.playlistRepository.update(id, updatePlaylistDto);
    return this.getPlaylistById(id);
  }

  async deletePlaylist(id: string, userId: string): Promise<void> {
    const playlist = await this.getPlaylistById(id);

    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own playlists');
    }

    await this.playlistRepository.delete(id);
  }

  async addSongToPlaylist(
    playlistId: string,
    addSongDto: AddSongToPlaylistDto,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.getPlaylistById(playlistId);
    const song = await this.getSongById(addSongDto.songId);

    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You can only modify your own playlists');
    }

    // Check if song is already in playlist
    const songExists = playlist.songs.some((s) => s.id === song.id);
    if (songExists) {
      throw new BadRequestException('Song is already in this playlist');
    }

    playlist.songs.push(song);
    await this.playlistRepository.save(playlist);

    return this.getPlaylistById(playlistId);
  }

  async removeSongFromPlaylist(
    playlistId: string,
    songId: string,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.getPlaylistById(playlistId);

    if (playlist.ownerId !== userId) {
      throw new ForbiddenException('You can only modify your own playlists');
    }

    playlist.songs = playlist.songs.filter((song) => song.id !== songId);
    await this.playlistRepository.save(playlist);

    return this.getPlaylistById(playlistId);
  }

  // Recommendation system (basic implementation)
  async getRecommendedSongs(userId: string): Promise<Song[]> {
    // Basic recommendation: popular songs + songs from user's playlists' genres
    const userPlaylists = await this.getUserPlaylists(userId);
    const userGenres = new Set<string>();

    // Collect user's favorite genres
    for (const playlist of userPlaylists) {
      for (const song of playlist.songs) {
        if (song.genres) {
          song.genres.forEach((genre) => userGenres.add(genre));
        }
      }
    }

    if (userGenres.size === 0) {
      // If no user preferences, return popular songs
      return this.songRepository.find({
        order: { playCount: 'DESC', likes: 'DESC' },
        take: 20,
      });
    }

    // Find songs with similar genres
    const genresArray = Array.from(userGenres);
    return this.songRepository
      .createQueryBuilder('song')
      .where('song.genres && :genres', { genres: genresArray })
      .orderBy('song.playCount', 'DESC')
      .addOrderBy('song.likes', 'DESC')
      .take(20)
      .getMany();
  }
}
