/**
 * 동기화 서비스
 *
 * 오프라인 큐의 항목을 서버와 동기화
 */
import { useOfflineQueueStore, QueueItem } from '@/stores/offlineQueue.store';
import { useNetworkStore, isOnline } from '@/stores/network.store';
import { apiClient } from '@/api/client';

type SyncHandler = (item: QueueItem) => Promise<void>;

const syncHandlers: Record<string, SyncHandler> = {
  ATTENDANCE_CHECK_IN: async (item) => {
    const { latitude, longitude, type } = item.payload;
    await apiClient.post(`/m/api/duties/check-in?type=${type || 'QR'}`, {
      latitude,
      longitude,
    });
  },

  ATTENDANCE_CHECK_OUT: async (item) => {
    const { latitude, longitude, type } = item.payload;
    await apiClient.post(`/m/api/duties/check-out?type=${type || 'QR'}`, {
      latitude,
      longitude,
    });
  },

  PATROL_CHECKPOINT: async (item) => {
    const { checkpointId, latitude, longitude, timestamp } = item.payload;
    await apiClient.post('/m/api/patrols/checkpoint', {
      checkpointId,
      latitude,
      longitude,
      timestamp,
    });
  },

  SCAN_LOG: async (item) => {
    const { scanType, scanData, latitude, longitude, timestamp } = item.payload;
    await apiClient.post('/m/api/scans/log', {
      scanType,
      scanData,
      latitude,
      longitude,
      timestamp,
    });
  },
};

/**
 * 단일 항목 동기화
 */
const syncItem = async (item: QueueItem): Promise<boolean> => {
  const handler = syncHandlers[item.type];

  if (!handler) {
    console.error('[SyncService] 핸들러 없음:', item.type);
    return false;
  }

  try {
    await handler(item);
    console.log('[SyncService] 동기화 성공:', item.id);
    return true;
  } catch (error) {
    console.error('[SyncService] 동기화 실패:', item.id, error);
    return false;
  }
};

/**
 * 전체 큐 동기화
 */
export const syncOfflineQueue = async (): Promise<{
  success: number;
  failed: number;
  remaining: number;
}> => {
  const store = useOfflineQueueStore.getState();

  // 이미 동기화 중이면 스킵
  if (store.isSyncing) {
    console.log('[SyncService] 이미 동기화 중');
    return { success: 0, failed: 0, remaining: store.queue.length };
  }

  // 오프라인이면 스킵
  if (!isOnline()) {
    console.log('[SyncService] 오프라인 상태');
    return { success: 0, failed: 0, remaining: store.queue.length };
  }

  const queue = [...store.queue];

  if (queue.length === 0) {
    console.log('[SyncService] 동기화할 항목 없음');
    return { success: 0, failed: 0, remaining: 0 };
  }

  console.log('[SyncService] 동기화 시작:', queue.length, '개 항목');
  store.setSyncing(true);

  let success = 0;
  let failed = 0;

  // 타임스탬프 순으로 정렬 (오래된 것부터)
  const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

  for (const item of sortedQueue) {
    // 동기화 중 오프라인 되면 중단
    if (!isOnline()) {
      console.log('[SyncService] 오프라인 전환, 동기화 중단');
      break;
    }

    const result = await syncItem(item);

    if (result) {
      success++;
      store.removeFromQueue(item.id);
    } else {
      store.incrementRetry(item.id);

      // 최대 재시도 초과 시 제거
      if (item.retryCount >= item.maxRetries - 1) {
        console.log('[SyncService] 최대 재시도 초과, 항목 제거:', item.id);
        store.removeFromQueue(item.id);
        failed++;
      }
    }
  }

  store.setSyncing(false);
  store.setLastSyncAt(Date.now());

  const remaining = useOfflineQueueStore.getState().queue.length;

  console.log('[SyncService] 동기화 완료:', { success, failed, remaining });

  return { success, failed, remaining };
};

/**
 * 네트워크 복구 시 자동 동기화 시작
 */
export const startAutoSync = (): (() => void) => {
  console.log('[SyncService] 자동 동기화 활성화');

  // 네트워크 상태 변경 구독
  const unsubscribe = useNetworkStore.subscribe((state, prevState) => {
    const isNowOnline = state.isConnected && state.isInternetReachable;
    const wasOnline = prevState.isConnected && prevState.isInternetReachable;

    // 오프라인 -> 온라인 전환 감지
    if (!wasOnline && isNowOnline) {
      console.log('[SyncService] 온라인 복구 감지, 동기화 시작');
      // 약간의 딜레이 후 동기화 (네트워크 안정화 대기)
      setTimeout(() => {
        syncOfflineQueue();
      }, 2000);
    }
  });

  // 초기 동기화 (앱 시작 시 큐에 항목이 있으면 동기화)
  setTimeout(() => {
    const queue = useOfflineQueueStore.getState().queue;
    if (queue.length > 0 && isOnline()) {
      console.log('[SyncService] 초기 동기화 시작');
      syncOfflineQueue();
    }
  }, 3000);

  return unsubscribe;
};
