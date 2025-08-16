import { IsString, IsOptional, IsArray, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateSongDto {
  @IsString()
  title: string;

  @IsString()
  artist: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];
}

export class CreatePlaylistDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdatePlaylistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class AddSongToPlaylistDto {
  @IsString()
  songId: string;
}
