import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  pushEnabled: boolean;
  workOrderAlerts: boolean;
  patrolReminders: boolean;
  systemAlerts: boolean;
}

interface SettingsState {
  // State
  notifications: NotificationSettings;
  favoriteMenus: string[];
  lastSyncedAt: string | null;

  // Actions
  setNotificationSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => void;
  addFavoriteMenu: (menuId: string) => void;
  removeFavoriteMenu: (menuId: string) => void;
  setLastSyncedAt: (date: string) => void;
  resetSettings: () => void;
}

const defaultNotifications: NotificationSettings = {
  pushEnabled: true,
  workOrderAlerts: true,
  patrolReminders: true,
  systemAlerts: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial State
      notifications: defaultNotifications,
      favoriteMenus: [],
      lastSyncedAt: null,

      // Actions
      setNotificationSetting: (key, value) => {
        set({
          notifications: {
            ...get().notifications,
            [key]: value,
          },
        });
      },

      addFavoriteMenu: (menuId) => {
        const current = get().favoriteMenus;
        if (!current.includes(menuId)) {
          set({ favoriteMenus: [...current, menuId] });
        }
      },

      removeFavoriteMenu: (menuId) => {
        set({
          favoriteMenus: get().favoriteMenus.filter((id) => id !== menuId),
        });
      },

      setLastSyncedAt: (date) => set({ lastSyncedAt: date }),

      resetSettings: () => {
        set({
          notifications: defaultNotifications,
          favoriteMenus: [],
        });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
