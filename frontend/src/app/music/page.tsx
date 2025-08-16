'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { usePlayerStore } from '@/lib/store/player';
import { musicAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';
import { Playlist } from '@/types';

export default function MusicPage() {
  const { token } = useAuthStore();
  const { queue, setQueue, playSong } = usePlayerStore();

  useEffect(() => {
    // Fetch playlist from API
    async function fetchPlaylist() {
      if (!token) return;
      const res = await musicAPI.getPlaylists(token);
      if (res.success && res.data) {
        const playlists = res.data as Playlist[];
        if (playlists.length > 0) {
          setQueue(playlists[0].songs);
        }
      }
    }
    fetchPlaylist();
  }, [token, setQueue]);

  return (
    <div className="flex h-full">
      {/* Playlist */}
      <div className="w-80 border-r border-gray-800 bg-gray-900 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Playlist</h2>
        <ul>
          {queue.map(song => (
            <li
              key={song.id}
              className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-gray-800 rounded-lg p-2"
              onClick={() => playSong(song)}
            >
              <Image 
                src={song.coverImage || '/placeholder-music.jpg'} 
                alt={song.title} 
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover bg-gray-700" 
              />
              <div>
                <div className="text-white font-medium">{song.title}</div>
                <div className="text-gray-400 text-sm">{song.artist}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Song Suggestions */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Song Suggestions</h2>
        {/* TODO: Render recommendations */}
        <div className="text-gray-400">Coming soon...</div>
      </div>
    </div>
  );
}
