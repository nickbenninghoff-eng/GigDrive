import { create } from 'zustand';
import apiClient from '../api/client';

interface User {
  id: number;
  email: string;
  displayName: string | null;
  tier: string;
  gigPlatforms: string[] | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('auth_token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post('/auth/register', { email, password, displayName });
      localStorage.setItem('auth_token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get('/auth/me');
      set({ user: data, isLoading: false });
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
