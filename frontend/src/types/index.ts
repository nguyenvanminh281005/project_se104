// User types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

// Music types
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  url: string;
  coverImage?: string;
  genre?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  songs: Song[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
}

// Chat types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'audio' | 'video';
  replyTo?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

// Call types
export interface CallState {
  isInCall: boolean;
  callType: 'audio' | 'video' | null;
  caller?: User;
  receiver?: User;
  callStatus: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Login/Register response types
export interface AuthResponse {
  user: User;
  token: string;
}

// Generic API error response
export interface ErrorResponse {
  error: string;
  message?: string;
}

// Socket events
export interface SocketEvents {
  // User events
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
  
  // Message events
  'message:new': (message: Message) => void;
  'message:read': (messageId: string) => void;
  'message:typing': (data: { userId: string; conversationId: string }) => void;
  'message:stop-typing': (data: { userId: string; conversationId: string }) => void;
  
  // Call events
  'call:incoming': (data: { caller: User; callType: 'audio' | 'video' }) => void;
  'call:accepted': () => void;
  'call:rejected': () => void;
  'call:ended': () => void;
  'call:offer': (offer: RTCSessionDescriptionInit) => void;
  'call:answer': (answer: RTCSessionDescriptionInit) => void;
  'call:ice-candidate': (candidate: RTCIceCandidate) => void;
}
