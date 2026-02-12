/**
 * 오프라인 큐 스토어
 *
 * 오프라인 상태에서 발생한 요청을 저장하고 온라인 복귀 시 동기화
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type QueueItemType =
  | 'ATTENDANCE_CHECK_IN'
  | 'ATTENDANCE_CHECK_OUT'
  | 'PATROL_CHECKPOINT'
  | 'SCAN_LOG';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineQueueState {
  // State
  queue: QueueItem[];
  isSyncing: boolean;
  lastSyncAt: number | null;

  // Actions
  addToQueue: (type: QueueItemType, payload: Record<string, unknown>) => string;
  removeFromQueue: (id: string) => void;
  incrementRetry: (id: string) => void;
  clearQueue: () => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (timestamp: number) => void;
  getQueueByType: (type: QueueItemType) => QueueItem[];
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      // Initial State
      queue: [],
      isSyncing: false,
      lastSyncAt: null,

      // Actions
      addToQueue: (type, payload) => {
        const id = generateId();
        const item: QueueItem = {
          id,
          type,
          payload,
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
        };

        console.log('[OfflineQueue] 항목 추가:', type, id);

        set((state) => ({
          queue: [...state.queue, item],
        }));

        return id;
      },

      removeFromQueue: (id) => {
        console.log('[OfflineQueue] 항목 제거:', id);
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },

      incrementRetry: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
          ),
        }));
      },

      clearQueue: () => {
        console.log('[OfflineQueue] 큐 초기화');
        set({ queue: [] });
      },

      setSyncing: (syncing) => {
        set({ isSyncing: syncing });
      },

      setLastSyncAt: (timestamp) => {
        set({ lastSyncAt: timestamp });
      },

      getQueueByType: (type) => {
        return get().queue.filter((item) => item.type === type);
      },
    }),
    {
      name: 'offline-queue-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
