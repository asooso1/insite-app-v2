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

      // Actions
      setLoading: (isLoading) => set({ isLoading }),

      setSeniorMode: (isSeniorMode) => set({ isSeniorMode }),

      toggleSeniorMode: () => set({ isSeniorMode: !get().isSeniorMode }),

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
    }
  )
);
