import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import type { UserInfo } from '@/types/models';

export interface ModelOption {
  id: string;
  name: string;
}

interface AuthState {
  appKey: string;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  error: string | null;
  selectedModel: string;
  availableModels: ModelOption[];

  login: (appKey: string, model?: string) => Promise<void>;
  fetchModels: (appKey: string) => Promise<ModelOption[]>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  appKey: '',
  sessionToken: null,
  isAuthenticated: false,
  isLoading: true,
  userInfo: null,
  error: null,
  selectedModel: 'qwen-image-2.0',
  availableModels: [],

  fetchModels: async (appKey: string) => {
    const res = await apiClient.post('/api/auth/models', { app_key: appKey });
    const data = res.data;
    set({
      availableModels: data.models || [],
      selectedModel: data.default || 'qwen-image-2.0',
    });
    return data.models || [];
  },

  login: async (appKey: string, model?: string) => {
    set({ isLoading: true, error: null });
    try {
      const selectedModel = model || useAuthStore.getState().selectedModel;
      const res = await apiClient.post('/api/auth/login', {
        app_key: appKey,
        model: selectedModel,
      });
      const data = res.data;
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('selected_model', selectedModel);
      set({
        appKey,
        sessionToken: data.session_token,
        isAuthenticated: true,
        isLoading: false,
        userInfo: data.user,
        selectedModel: data.user?.model || selectedModel,
        error: null,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: { message?: string } } } })?.response?.data?.detail?.message
        || (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || (err as Error).message
        || '登录失败，请检查 AppKey 后重试';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('selected_model');
    set({
      appKey: '',
      sessionToken: null,
      isAuthenticated: false,
      userInfo: null,
      error: null,
      selectedModel: 'qwen-image-2.0',
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('session_token');
    const savedModel = localStorage.getItem('selected_model');
    if (savedModel) {
      set({ selectedModel: savedModel });
    }
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await apiClient.post('/api/auth/verify');
      if (res.data.valid) {
        set({ sessionToken: token, isAuthenticated: true, isLoading: false, userInfo: res.data.user });
      } else {
        localStorage.removeItem('session_token');
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
