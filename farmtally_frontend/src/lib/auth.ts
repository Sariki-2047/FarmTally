/**
 * Authentication utilities and context
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, User, LoginRequest, RegisterRequest } from './api';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login(credentials);
          if (response.success && response.data) {
            const { tokens, user } = response.data;
            const token = tokens.accessToken;
            apiClient.setToken(token);
            
            // Transform user data to match expected format
            const transformedUser = {
              id: user.id,
              email: user.email,
              firstName: user.profile?.firstName || user.profile?.first_name || '',
              lastName: user.profile?.lastName || user.profile?.last_name || '',
              role: user.role,
              status: user.status,
              organization: user.organization || { id: '', name: '' }
            };
            
            set({
              user: transformedUser,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register(userData);
          if (response.success && response.data) {
            const { token, user } = response.data;
            apiClient.setToken(token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        apiClient.clearToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const { token, user } = get();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }
        
        // If we already have user data, don't re-validate unless necessary
        if (user) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token might be invalid, but don't immediately logout
            // Let the user try to use the app and handle errors gracefully
            set({ isLoading: false });
          }
        } catch (error) {
          // Don't immediately logout on network errors
          // Only logout if it's clearly an auth error
          const errorMessage = error instanceof Error ? error.message : '';
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
            get().logout();
          } else {
            // Network error or other issue, keep the user logged in
            set({ isLoading: false });
          }
        }
      },

      // Validate token without logging out
      validateToken: async (): Promise<boolean> => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await apiClient.getCurrentUser();
          return response.success;
        } catch (error) {
          return false;
        }
      },
    }),
    {
      name: 'farmtally-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const getUserRole = (user: User | null): string => {
  return user?.role || '';
};

export const isApplicationAdmin = (user: User | null): boolean => {
  return user?.role === 'APPLICATION_ADMIN';
};

export const isFarmAdmin = (user: User | null): boolean => {
  return user?.role === 'FARM_ADMIN';
};

export const isFieldManager = (user: User | null): boolean => {
  return user?.role === 'FIELD_MANAGER';
};

export const isFarmer = (user: User | null): boolean => {
  return user?.role === 'FARMER';
};

export const getDisplayName = (user: User | null): string => {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
};

export const getOrganizationName = (user: User | null): string => {
  return user?.organization?.name || '';
};