import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { MusicService } from './music.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';
import {
  CreateSongDto,
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddSongToPlaylistDto,
} from './dto/music.dto';

@Controller('music')
export class MusicController {
  constructor(private musicService: MusicService) {}

  // Song endpoints
  @Post('songs/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/songs',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
          cb(null, true);
        } else {
          cb(new Error('Only audio files are allowed'), false);
        }
      },
    }),
  )
  async uploadSong(
    @UploadedFile() file: Express.Multer.File,
    @Body() createSongDto: CreateSongDto,
    @GetUser() user: User,
  ) {
    return this.musicService.createSong(createSongDto, file.path, user.id);
  }

  @Get('songs')
  async getAllSongs() {
    return this.musicService.getAllSongs();
  }

  @Get('songs/search')
  async searchSongs(@Query('q') query: string) {
    return this.musicService.searchSongs(query);
  }

  @Get('songs/genre/:genre')
  async getSongsByGenre(@Param('genre') genre: string) {
    return this.musicService.getSongsByGenre(genre);
  }

  @Get('songs/recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendedSongs(@GetUser() user: User) {
    return this.musicService.getRecommendedSongs(user.id);
  }

  @Get('songs/:id')
  async getSongById(@Param('id') id: string) {
    return this.musicService.getSongById(id);
  }

  @Get('songs/:id/stream')
  async streamSong(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const song = await this.musicService.getSongById(id);
    
    // Increment play count
    await this.musicService.incrementPlayCount(id);

    const filePath = join(process.cwd(), song.filePath);
    
    if (!existsSync(filePath)) {
      throw new Error('Song file not found');
    }

    const file = createReadStream(filePath);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `inline; filename="${song.title}.mp3"`,
    });

    return new StreamableFile(file);
  }

  @Post('songs/:id/like')
  @UseGuards(JwtAuthGuard)
  async likeSong(@Param('id') id: string) {
    await this.musicService.likeSong(id);
    return { message: 'Song liked successfully' };
  }

  @Delete('songs/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSong(@Param('id') id: string, @GetUser() user: User) {
    await this.musicService.deleteSong(id, user.id);
    return { message: 'Song deleted successfully' };
  }

  // Playlist endpoints
  @Post('playlists')
  @UseGuards(JwtAuthGuard)
  async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDto, @GetUser() user: User) {
    return this.musicService.createPlaylist(createPlaylistDto, user.id);
  }

  @Get('playlists/my')
  @UseGuards(JwtAuthGuard)
  async getUserPlaylists(@GetUser() user: User) {
    return this.musicService.getUserPlaylists(user.id);
  }

  @Get('playlists/public')
  async getPublicPlaylists() {
    return this.musicService.getPublicPlaylists();
  }

  @Get('playlists/:id')
  async getPlaylistById(@Param('id') id: string) {
    return this.musicService.getPlaylistById(id);
  }

  @Patch('playlists/:id')
  @UseGuards(JwtAuthGuard)
  async updatePlaylist(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @GetUser() user: User,
  ) {
    return this.musicService.updatePlaylist(id, updatePlaylistDto, user.id);
  }

  @Delete('playlists/:id')
  @UseGuards(JwtAuthGuard)
  async deletePlaylist(@Param('id') id: string, @GetUser() user: User) {
    await this.musicService.deletePlaylist(id, user.id);
    return { message: 'Playlist deleted successfully' };
  }

  @Post('playlists/:id/songs')
  @UseGuards(JwtAuthGuard)
  async addSongToPlaylist(
    @Param('id') id: string,
    @Body() addSongDto: AddSongToPlaylistDto,
    @GetUser() user: User,
  ) {
    return this.musicService.addSongToPlaylist(id, addSongDto, user.id);
  }

  @Delete('playlists/:id/songs/:songId')
  @UseGuards(JwtAuthGuard)
  async removeSongFromPlaylist(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @GetUser() user: User,
  ) {
    return this.musicService.removeSongFromPlaylist(id, songId, user.id);
  }
}
