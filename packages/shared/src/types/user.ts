export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum StylePreference {
  CASUAL = 'casual',
  FORMAL = 'formal',
  SPORTY = 'sporty',
  BOHEMIAN = 'bohemian',
  MINIMALIST = 'minimalist',
  STREETWEAR = 'streetwear',
  VINTAGE = 'vintage',
  PREPPY = 'preppy',
}

export enum BodyType {
  SLIM = 'slim',
  ATHLETIC = 'athletic',
  AVERAGE = 'average',
  CURVY = 'curvy',
  PLUS = 'plus',
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  stylePreferences: StylePreference[];
  bodyType?: BodyType;
  height?: number; // cm
  weight?: number; // kg
  location?: string;
  isPublic: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface UpdateUserDto {
  displayName?: string;
  bio?: string;
  stylePreferences?: StylePreference[];
  bodyType?: BodyType;
  height?: number;
  weight?: number;
  location?: string;
  isPublic?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginDto {
  email: string;
  password: string;
}
