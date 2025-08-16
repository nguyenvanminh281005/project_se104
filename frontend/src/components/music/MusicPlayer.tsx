'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react';
import { usePlayerStore } from '@/lib/store/player';

export const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging] = useState(false); // TODO: Implement drag functionality

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleShuffle,
    setRepeat,
    updateCurrentTime,
    setDuration,
  } = usePlayerStore();

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        updateCurrentTime(audio.currentTime);
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDragging, repeat, nextSong, updateCurrentTime, setDuration]);

  // Update audio src when current song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.url;
    audio.load();
  }, [currentSong]);

  // Play/pause when isPlaying changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Update current time when seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isDragging) return;

    audio.currentTime = currentTime;
  }, [currentTime, isDragging]);

  const handlePlayPause = () => {
    if (!currentSong) return;

    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleRepeatToggle = () => {
    const nextRepeat = repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none';
    setRepeat(nextRepeat);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'one':
        return <Repeat1 size={20} className="text-blue-400" />;
      case 'all':
        return <Repeat size={20} className="text-blue-400" />;
      default:
        return <Repeat size={20} className="text-gray-400" />;
    }
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4">
      <audio ref={audioRef} />
      
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            {currentSong.coverImage ? (
              <Image 
                src={currentSong.coverImage} 
                alt={currentSong.title}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Play size={16} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {currentSong.title}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md mx-8">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleShuffle}
              className={`p-1 rounded ${shuffle ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Shuffle size={20} />
            </button>
            
            <button
              onClick={previousSong}
              className="p-1 text-gray-400 hover:text-white"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={nextSong}
              className="p-1 text-gray-400 hover:text-white"
            >
              <SkipForward size={20} />
            </button>
            
            <button
              onClick={handleRepeatToggle}
              className="p-1 rounded"
            >
              {getRepeatIcon()}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            
            <div
              className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full relative group-hover:bg-blue-400 transition-colors"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <button
            onClick={toggleMute}
            className="p-1 text-gray-400 hover:text-white"
          >
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div
            className="w-20 h-1 bg-gray-700 rounded-full cursor-pointer group"
            onClick={handleVolumeChange}
          >
            <div
              className="h-full bg-white rounded-full group-hover:bg-blue-400 transition-colors"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
