import { ApiResponse, User, Song, Playlist, Conversation, Message } from '@/types';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    isOnline: true,
  },
  {
    id: '2', 
    username: 'john_doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=27AE60&color=fff',
    isOnline: true,
  },
  {
    id: '3',
    username: 'jane_smith', 
    email: 'jane@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=E74C3C&color=fff',
    isOnline: false,
  }
];

const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverImage: 'https://picsum.photos/300/300?random=1',
    genre: 'Pop'
  },
  {
    id: '2', 
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 235,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverImage: 'https://picsum.photos/300/300?random=2',
    genre: 'Pop'
  },
  {
    id: '3',
    title: 'Bad Guy',
    artist: 'Billie Eilish', 
    album: 'When We All Fall Asleep, Where Do We Go?',
    duration: 194,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverImage: 'https://picsum.photos/300/300?random=3',
    genre: 'Alternative'
  }
];

const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: 'My Favorites',
    description: 'My favorite songs collection',
    coverImage: 'https://picsum.photos/400/400?random=playlist1',
    songs: mockSongs,
    createdBy: '1',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey, how are you?',
    senderId: '2',
    receiverId: '1', 
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
    messageType: 'text'
  },
  {
    id: '2',
    content: 'I am doing great! Thanks for asking',
    senderId: '1',
    receiverId: '2',
    timestamp: new Date(Date.now() - 3500000), 
    isRead: true,
    messageType: 'text'
  }
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: mockMessages[1],
    unreadCount: 0,
    updatedAt: new Date()
  },
  {
    id: '2', 
    participants: [mockUsers[0], mockUsers[2]],
    unreadCount: 2,
    updatedAt: new Date()
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API client
class MockApiClient {
  async request<T>(endpoint: string, config: any = {}): Promise<ApiResponse<T>> {
    await delay(500); // Simulate network delay
    
    console.log('Mock API Call:', endpoint, config);
    
    return {
      success: true,
      data: {} as T,
      message: 'Success'
    };
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    await delay(300);
    console.log('Mock GET:', endpoint);
    
    return {
      success: true,
      data: {} as T
    };
  }

  async post<T>(endpoint: string, data?: any, token?: string): Promise<ApiResponse<T>> {
    await delay(500);
    console.log('Mock POST:', endpoint, data);
    
    return {
      success: true,
      data: {} as T
    };
  }

  async put<T>(endpoint: string, data?: any, token?: string): Promise<ApiResponse<T>> {
    await delay(400);
    console.log('Mock PUT:', endpoint, data);
    
    return {
      success: true,
      data: {} as T
    };
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    await delay(300);
    console.log('Mock DELETE:', endpoint);
    
    return {
      success: true,
      data: {} as T
    };
  }

  async upload<T>(endpoint: string, file: File, token?: string): Promise<ApiResponse<T>> {
    await delay(1000);
    console.log('Mock UPLOAD:', endpoint, file.name);
    
    return {
      success: true,
      data: {} as T
    };
  }
}

export const mockApiClient = new MockApiClient();

// Mock Auth API
export const mockAuthAPI = {
  login: async (credentials: { email: string; password: string }) => {
    await delay(800);
    
    // Simple mock validation
    if (credentials.email === 'admin@example.com' && credentials.password === 'password123') {
      return {
        success: true,
        data: {
          user: mockUsers[0],
          token: 'mock-jwt-token-12345'
        }
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    await delay(1000);
    
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      isOnline: true
    };
    
    return {
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token-' + Date.now()
      }
    };
  },

  logout: async (token: string) => {
    await delay(200);
    return { success: true };
  },

  refreshToken: async (token: string) => {
    await delay(300);
    return {
      success: true,
      data: { token: 'new-mock-token-' + Date.now() }
    };
  },

  getProfile: async (token: string) => {
    await delay(400);
    return {
      success: true,
      data: mockUsers[0]
    };
  }
};

// Mock Music API
export const mockMusicAPI = {
  getPlaylists: async (token: string) => {
    await delay(600);
    return {
      success: true,
      data: mockPlaylists
    };
  },

  getPlaylist: async (id: string, token: string) => {
    await delay(400);
    const playlist = mockPlaylists.find(p => p.id === id);
    return {
      success: true,
      data: playlist
    };
  },

  getSongs: async (token: string) => {
    await delay(500);
    return {
      success: true,
      data: mockSongs
    };
  },

  getSong: async (id: string, token: string) => {
    await delay(300);
    const song = mockSongs.find(s => s.id === id);
    return {
      success: true,
      data: song
    };
  },

  searchSongs: async (query: string, token: string) => {
    await delay(400);
    const results = mockSongs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );
    return {
      success: true,
      data: results
    };
  },

  getRecommendations: async (token: string) => {
    await delay(700);
    return {
      success: true,
      data: mockSongs.slice(0, 5)
    };
  }
};

// Mock Chat API
export const mockChatAPI = {
  getConversations: async (token: string) => {
    await delay(500);
    return {
      success: true,
      data: mockConversations
    };
  },

  getMessages: async (conversationId: string, token: string) => {
    await delay(400);
    return {
      success: true,
      data: mockMessages
    };
  },

  sendMessage: async (data: { receiverId: string; content: string }, token: string) => {
    await delay(300);
    const newMessage: Message = {
      id: Date.now().toString(),
      content: data.content,
      senderId: '1', // Current user
      receiverId: data.receiverId,
      timestamp: new Date(),
      isRead: false,
      messageType: 'text'
    };
    return {
      success: true,
      data: newMessage
    };
  },

  markAsRead: async (messageId: string, token: string) => {
    await delay(200);
    return { success: true };
  },

  moderateMessage: async (content: string, token: string) => {
    await delay(300);
    // Simple moderation - block messages with bad words
    const badWords = ['spam', 'bad', 'inappropriate'];
    const hasBadWords = badWords.some(word => content.toLowerCase().includes(word));
    
    return {
      success: !hasBadWords,
      data: { approved: !hasBadWords }
    };
  }
};

// Mock User API
export const mockUserAPI = {
  getUsers: async (token: string) => {
    await delay(500);
    return {
      success: true,
      data: mockUsers.slice(1) // Exclude current user
    };
  },

  getUser: async (id: string, token: string) => {
    await delay(300);
    const user = mockUsers.find(u => u.id === id);
    return {
      success: true,
      data: user
    };
  },

  updateProfile: async (data: Partial<{ username: string; avatar: string }>, token: string) => {
    await delay(600);
    return {
      success: true,
      data: { ...mockUsers[0], ...data }
    };
  },

  uploadAvatar: async (file: File, token: string) => {
    await delay(1200);
    return {
      success: true,
      data: { avatar: `https://ui-avatars.com/api/?name=${file.name}&background=random` }
    };
  }
};
