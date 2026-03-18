// Re-export all shared types for convenience
export * from '@moodfit/shared';

// Web-specific types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface FilterOptions {
  categories?: string[];
  colors?: string[];
  seasons?: string[];
  occasions?: string[];
  sortBy?: 'newest' | 'oldest' | 'most_worn' | 'least_worn' | 'name';
}

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
