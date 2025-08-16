import { create } from 'zustand';
import { PlayerState, Song } from '@/types';

interface PlayerStore extends PlayerState {
  // Player actions
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setRepeat: (repeat: 'none' | 'one' | 'all') => void;
  updateCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  
  // Queue management
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[]) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  queue: [],
  shuffle: false,
  repeat: 'none',

  playSong: (song: Song) => {
    set({
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
    });
  },

  pauseSong: () => {
    set({ isPlaying: false });
  },

  resumeSong: () => {
    set({ isPlaying: true });
  },

  nextSong: () => {
    const { queue, currentSong, shuffle, repeat } = get();
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    let nextIndex = 0;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return; // End of queue
        }
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      set({
        currentSong: nextSong,
        currentTime: 0,
        isPlaying: true,
      });
    }
  },

  previousSong: () => {
    const { queue, currentSong, shuffle } = get();
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    let prevIndex = 0;

    if (shuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }
    }

    const prevSong = queue[prevIndex];
    if (prevSong) {
      set({
        currentSong: prevSong,
        currentTime: 0,
        isPlaying: true,
      });
    }
  },

  seekTo: (time: number) => {
    set({ currentTime: time });
  },

  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  setRepeat: (repeat: 'none' | 'one' | 'all') => {
    set({ repeat });
  },

  updateCurrentTime: (time: number) => {
    const { duration, repeat, currentSong } = get();
    
    // Check if song ended
    if (time >= duration && duration > 0) {
      if (repeat === 'one') {
        set({ currentTime: 0, isPlaying: true });
      } else {
        get().nextSong();
      }
    } else {
      set({ currentTime: time });
    }
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  addToQueue: (song: Song) => {
    set((state) => ({
      queue: [...state.queue, song],
    }));
  },

  removeFromQueue: (songId: string) => {
    set((state) => ({
      queue: state.queue.filter(song => song.id !== songId),
    }));
  },

  clearQueue: () => {
    set({ queue: [] });
  },

  setQueue: (songs: Song[]) => {
    set({ queue: songs });
  },
}));
