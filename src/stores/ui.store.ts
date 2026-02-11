import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  // State
  isLoading: boolean;
  isSeniorMode: boolean;
  themeMode: ThemeMode;
  isOnline: boolean;
  isHydrated: boolean; // persist 복원 완료 여부

  // Actions
  setLoading: (isLoading: boolean) => void;
  setSeniorMode: (isSeniorMode: boolean) => void;
  toggleSeniorMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setOnline: (isOnline: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial State
      isLoading: false,
      isSeniorMode: false,
      themeMode: 'light',
      isOnline: true,
      isHydrated: false,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),

      setSeniorMode: (isSeniorMode) => {
        console.log('[UIStore] 시니어 모드 설정:', isSeniorMode);
        set({ isSeniorMode });
      },

      toggleSeniorMode: () => {
        const newValue = !get().isSeniorMode;
        console.log('[UIStore] 시니어 모드 토글:', newValue);
        set({ isSeniorMode: newValue });
      },

      setThemeMode: (themeMode) => set({ themeMode }),

      setOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isSeniorMode: state.isSeniorMode,
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        // persist 복원 완료 시 호출
        if (state) {
          console.log('[UIStore] Hydration 완료, 시니어 모드:', state.isSeniorMode);
          state.isHydrated = true;
        }
      },
    }
  )
);

// Hydration 완료 후 상태 업데이트를 위한 리스너
// (onRehydrateStorage가 set을 호출할 수 없으므로 별도 처리)
useUIStore.persist.onFinishHydration(() => {
  console.log('[UIStore] Hydration 완료 이벤트');
  useUIStore.setState({ isHydrated: true });
});
