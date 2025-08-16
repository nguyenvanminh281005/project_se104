import { ApiResponse } from '@/types';
import { 
  mockApiClient, 
  mockAuthAPI, 
  mockMusicAPI, 
  mockChatAPI, 
  mockUserAPI 
} from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || true; // Set to true for demo

interface RequestConfig extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { token, ...restConfig } = config;
    
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(restConfig.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  // POST request
  async post<T>(
    endpoint: string, 
    data?: unknown, 
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      token,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string, 
    data?: unknown, 
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      token,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }

  // File upload
  async upload<T>(
    endpoint: string,
    file: File,
    token?: string
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

// Create API client instance
export const apiClient = USE_MOCK_API ? mockApiClient : new ApiClient(API_BASE_URL);

// Auth endpoints
export const authAPI = USE_MOCK_API ? mockAuthAPI : {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { username: string; email: string; password: string }) =>
    apiClient.post('/auth/register', userData),
  
  logout: (token: string) =>
    apiClient.post('/auth/logout', {}, token),
  
  refreshToken: (token: string) =>
    apiClient.post('/auth/refresh', {}, token),
  
  getProfile: (token: string) =>
    apiClient.get('/auth/profile', token),
};

// Music endpoints
export const musicAPI = USE_MOCK_API ? mockMusicAPI : {
  getPlaylists: (token: string) =>
    apiClient.get('/music/playlists', token),
  
  getPlaylist: (id: string, token: string) =>
    apiClient.get(`/music/playlists/${id}`, token),
  
  getSongs: (token: string) =>
    apiClient.get('/music/songs', token),
  
  getSong: (id: string, token: string) =>
    apiClient.get(`/music/songs/${id}`, token),
  
  searchSongs: (query: string, token: string) =>
    apiClient.get(`/music/search?q=${encodeURIComponent(query)}`, token),
  
  getRecommendations: (token: string) =>
    apiClient.get('/music/recommendations', token),
};

// Chat endpoints
export const chatAPI = USE_MOCK_API ? mockChatAPI : {
  getConversations: (token: string) =>
    apiClient.get('/chat/conversations', token),
  
  getMessages: (conversationId: string, token: string) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`, token),
  
  sendMessage: (data: { receiverId: string; content: string }, token: string) =>
    apiClient.post('/chat/messages', data, token),
  
  markAsRead: (messageId: string, token: string) =>
    apiClient.put(`/chat/messages/${messageId}/read`, {}, token),
  
  moderateMessage: (content: string, token: string) =>
    apiClient.post('/chat/moderate', { content }, token),
};

// User endpoints
export const userAPI = USE_MOCK_API ? mockUserAPI : {
  getUsers: (token: string) =>
    apiClient.get('/users', token),
  
  getUser: (id: string, token: string) =>
    apiClient.get(`/users/${id}`, token),
  
  updateProfile: (data: Partial<{ username: string; avatar: string }>, token: string) =>
    apiClient.put('/users/profile', data, token),
  
  uploadAvatar: (file: File, token: string) =>
    apiClient.upload('/users/avatar', file, token),
};
