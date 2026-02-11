import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { isTokenExpired } from '@/utils/jwt';
import { refreshTokenApi } from '@/api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  siteId?: string;
  siteName?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
  checkAuth: () => Promise<void>;
}

// Custom storage using SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      // Actions
      setAuth: (user, token, refreshToken) => {
        console.log('[AuthStore] setAuth 호출:', user.name);
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setToken: (token) => {
        console.log('[AuthStore] setToken 호출');
        set({ token });
      },

      logout: () => {
        console.log('[AuthStore] logout 호출');
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      hydrate: () => {
        // hydrate는 persist middleware의 onRehydrateStorage에서 자동 호출됨
        console.log('[AuthStore] hydrate 완료');
        set({ isHydrated: true });
      },

      checkAuth: async () => {
        const { token, refreshToken, logout, setToken } = get();

        console.log('[AuthStore] checkAuth 시작');

        // 토큰이 없으면 인증 실패
        if (!token) {
          console.log('[AuthStore] checkAuth: 토큰 없음 -> 미인증 상태');
          set({ isAuthenticated: false });
          return;
        }

        try {
          // 1. 토큰 만료 여부 확인 (60초 버퍼)
          const expired = isTokenExpired(token, 60);

          if (!expired) {
            // 토큰이 유효하면 인증 성공
            console.log('[AuthStore] checkAuth: 토큰 유효함 -> 인증 성공');
            set({ isAuthenticated: true });
            return;
          }

          console.log('[AuthStore] checkAuth: 토큰 만료됨, refresh 시도');

          // 2. 토큰이 만료되었으면 refresh token으로 갱신 시도
          if (!refreshToken) {
            console.log('[AuthStore] checkAuth: refresh token 없음 -> 로그아웃');
            logout();
            return;
          }

          // 3. Refresh token API 호출
          const response = await refreshTokenApi(refreshToken);

          if (response.code === 'success' && response.authToken) {
            console.log('[AuthStore] checkAuth: 토큰 갱신 성공');
            setToken(response.authToken);

            // refresh token도 갱신되었으면 함께 업데이트
            if (response.refreshToken) {
              set({ refreshToken: response.refreshToken });
            }

            set({ isAuthenticated: true });
            return;
          }

          // 4. Refresh 실패 시 로그아웃
          console.log('[AuthStore] checkAuth: 토큰 갱신 실패 -> 로그아웃');
          logout();
        } catch (error) {
          // 5. 에러 발생 시 로그아웃
          console.error('[AuthStore] checkAuth: 에러 발생 -> 로그아웃', error);
          logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrate();
        }
      },
    }
  )
);
