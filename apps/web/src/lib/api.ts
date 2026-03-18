import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  UserProfile,
  CreateUserDto,
  UpdateUserDto,
  AuthTokens,
  LoginDto,
  ClothingItem,
  CreateClothingItemDto,
  UpdateClothingItemDto,
  WardrobeStats,
  OutfitRecommendation,
  OutfitRecommendationRequest,
  OutfitPost,
  WearLog,
  OutfitComment,
} from '@moodfit/shared';
import { PaginatedResponse, FilterOptions } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - attach access token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle 401 and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('moodfit_access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('moodfit_refresh_token');
  }

  private setTokens(tokens: AuthTokens) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('moodfit_access_token', tokens.accessToken);
    localStorage.setItem('moodfit_refresh_token', tokens.refreshToken);
  }

  private clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('moodfit_access_token');
    localStorage.removeItem('moodfit_refresh_token');
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const response = await this.client.post<AuthTokens>('/auth/refresh', { refreshToken });
      this.setTokens(response.data);
      return response.data.accessToken;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client(config);
    return response.data;
  }

  // Auth endpoints
  auth = {
    register: (dto: CreateUserDto) =>
      this.request<{ user: UserProfile; tokens: AuthTokens }>({
        method: 'POST',
        url: '/auth/register',
        data: dto,
      }),

    login: async (dto: LoginDto) => {
      const result = await this.request<{ user: UserProfile; tokens: AuthTokens }>({
        method: 'POST',
        url: '/auth/login',
        data: dto,
      });
      this.setTokens(result.tokens);
      return result;
    },

    logout: async () => {
      await this.request({ method: 'POST', url: '/auth/logout' });
      this.clearTokens();
    },

    me: () =>
      this.request<UserProfile>({ method: 'GET', url: '/auth/me' }),
  };

  // User endpoints
  users = {
    getProfile: (username: string) =>
      this.request<UserProfile>({ method: 'GET', url: `/users/${username}` }),

    updateProfile: (dto: UpdateUserDto) =>
      this.request<UserProfile>({ method: 'PATCH', url: '/users/me', data: dto }),

    follow: (userId: string) =>
      this.request<void>({ method: 'POST', url: `/users/${userId}/follow` }),

    unfollow: (userId: string) =>
      this.request<void>({ method: 'DELETE', url: `/users/${userId}/follow` }),
  };

  // Wardrobe endpoints
  wardrobe = {
    getItems: (filters?: FilterOptions & { page?: number; limit?: number }) =>
      this.request<PaginatedResponse<ClothingItem>>({
        method: 'GET',
        url: '/wardrobe',
        params: filters,
      }),

    getItem: (id: string) =>
      this.request<ClothingItem>({ method: 'GET', url: `/wardrobe/${id}` }),

    createItem: (dto: CreateClothingItemDto) =>
      this.request<ClothingItem>({ method: 'POST', url: '/wardrobe', data: dto }),

    updateItem: (id: string, dto: UpdateClothingItemDto) =>
      this.request<ClothingItem>({ method: 'PATCH', url: `/wardrobe/${id}`, data: dto }),

    deleteItem: (id: string) =>
      this.request<void>({ method: 'DELETE', url: `/wardrobe/${id}` }),

    getStats: () =>
      this.request<WardrobeStats>({ method: 'GET', url: '/wardrobe/stats' }),

    uploadImage: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return this.request<{ imageUrl: string }>({
        method: 'POST',
        url: `/wardrobe/${id}/image`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  };

  // Outfit endpoints
  outfits = {
    getRecommendations: (page = 1, limit = 10) =>
      this.request<PaginatedResponse<OutfitRecommendation>>({
        method: 'GET',
        url: '/outfits/recommendations',
        params: { page, limit },
      }),

    getRecommendation: (id: string) =>
      this.request<OutfitRecommendation>({ method: 'GET', url: `/outfits/recommendations/${id}` }),

    requestRecommendation: (dto: OutfitRecommendationRequest) =>
      this.request<OutfitRecommendation>({
        method: 'POST',
        url: '/outfits/recommend',
        data: dto,
      }),

    saveRecommendation: (id: string) =>
      this.request<OutfitRecommendation>({
        method: 'POST',
        url: `/outfits/recommendations/${id}/save`,
      }),

    logWear: (data: Partial<WearLog>) =>
      this.request<WearLog>({ method: 'POST', url: '/outfits/wear-log', data }),

    getWearHistory: (page = 1, limit = 20) =>
      this.request<PaginatedResponse<WearLog>>({
        method: 'GET',
        url: '/outfits/wear-log',
        params: { page, limit },
      }),
  };

  // Community endpoints
  community = {
    getFeed: (page = 1, limit = 20) =>
      this.request<PaginatedResponse<OutfitPost>>({
        method: 'GET',
        url: '/community/feed',
        params: { page, limit },
      }),

    getPost: (id: string) =>
      this.request<OutfitPost>({ method: 'GET', url: `/community/posts/${id}` }),

    createPost: (data: Partial<OutfitPost>) =>
      this.request<OutfitPost>({ method: 'POST', url: '/community/posts', data }),

    likePost: (id: string) =>
      this.request<void>({ method: 'POST', url: `/community/posts/${id}/like` }),

    unlikePost: (id: string) =>
      this.request<void>({ method: 'DELETE', url: `/community/posts/${id}/like` }),

    getComments: (postId: string, page = 1) =>
      this.request<PaginatedResponse<OutfitComment>>({
        method: 'GET',
        url: `/community/posts/${postId}/comments`,
        params: { page },
      }),

    addComment: (postId: string, content: string) =>
      this.request<OutfitComment>({
        method: 'POST',
        url: `/community/posts/${postId}/comments`,
        data: { content },
      }),
  };
}

export const api = new ApiClient();
export default api;
