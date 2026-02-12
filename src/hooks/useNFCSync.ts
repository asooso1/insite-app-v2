/**
 * NFC 동기화 훅
 *
 * NFC 스캔 결과의 오프라인 저장 및 자동 동기화 관리
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useOfflineQueueStore } from '@/stores/offlineQueue.store';
import { useNetworkStore } from '@/stores/network.store';
import {
  syncOfflineQueue,
  getPendingNFCScansCount,
  savePatrolCheckpoint,
  saveScanLog,
  PatrolCheckpointPayload,
  ScanLogPayload,
} from '@/services/nfcSync';

interface UseNFCSyncOptions {
  /** 자동 동기화 활성화 */
  autoSync?: boolean;
  /** 동기화 간격 (ms) */
  syncInterval?: number;
  /** 네트워크 복귀 시 자동 동기화 */
  syncOnReconnect?: boolean;
}

interface UseNFCSyncReturn {
  /** 동기화 중 여부 */
  isSyncing: boolean;
  /** 대기 중인 항목 수 */
  pendingCount: number;
  /** 온라인 상태 */
  isOnline: boolean;
  /** 마지막 동기화 시간 */
  lastSyncAt: number | null;
  /** 수동 동기화 실행 */
  sync: () => Promise<{ synced: number; failed: number; remaining: number }>;
  /** 순찰 체크포인트 저장 */
  saveCheckpoint: (payload: PatrolCheckpointPayload) => Promise<{ success: boolean; queueId?: string }>;
  /** 스캔 로그 저장 */
  saveLog: (payload: ScanLogPayload) => Promise<{ success: boolean; queueId?: string }>;
}

/**
 * NFC 스캔 결과 동기화 훅
 *
 * @example
 * ```tsx
 * const { isSyncing, pendingCount, sync, saveCheckpoint } = useNFCSync();
 *
 * // 체크포인트 스캔 결과 저장
 * await saveCheckpoint({
 *   patrolId: '123',
 *   zoneId: 'zone-1',
 *   checkpointId: 'cp-1',
 *   tagId: 'NFC_TAG_ABC',
 *   scannedAt: Date.now(),
 * });
 *
 * // 수동 동기화
 * const result = await sync();
 * ```
 */
export function useNFCSync(options?: UseNFCSyncOptions): UseNFCSyncReturn {
  const {
    autoSync = true,
    syncInterval = 60000, // 1분
    syncOnReconnect = true,
  } = options || {};

  const { isSyncing: storeSyncing, lastSyncAt, queue } = useOfflineQueueStore();
  const { isConnected, isInternetReachable, startMonitoring } = useNetworkStore();

  const [pendingCount, setPendingCount] = useState(0);
  const prevOnlineRef = useRef(isConnected && isInternetReachable);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOnline = isConnected && isInternetReachable;

  /**
   * 대기 중인 항목 수 업데이트
   */
  const updatePendingCount = useCallback(() => {
    setPendingCount(getPendingNFCScansCount());
  }, []);

  /**
   * 동기화 실행
   */
  const sync = useCallback(async () => {
    if (!isOnline) {
      console.log('[useNFCSync] 오프라인 상태 - 동기화 건너뜀');
      return { synced: 0, failed: 0, remaining: pendingCount };
    }

    const result = await syncOfflineQueue();
    updatePendingCount();
    return result;
  }, [isOnline, pendingCount, updatePendingCount]);

  /**
   * 순찰 체크포인트 저장
   */
  const saveCheckpoint = useCallback(
    async (payload: PatrolCheckpointPayload) => {
      const result = await savePatrolCheckpoint(payload);
      updatePendingCount();
      return result;
    },
    [updatePendingCount]
  );

  /**
   * 스캔 로그 저장
   */
  const saveLog = useCallback(
    async (payload: ScanLogPayload) => {
      const result = await saveScanLog(payload);
      updatePendingCount();
      return result;
    },
    [updatePendingCount]
  );

  // 네트워크 모니터링 시작
  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  // 큐 변경 시 대기 항목 수 업데이트
  useEffect(() => {
    updatePendingCount();
  }, [queue, updatePendingCount]);

  // 네트워크 복귀 시 자동 동기화
  useEffect(() => {
    if (syncOnReconnect && isOnline && !prevOnlineRef.current && pendingCount > 0) {
      console.log('[useNFCSync] 네트워크 복귀 - 자동 동기화 시작');
      sync();
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline, syncOnReconnect, pendingCount, sync]);

  // 자동 동기화 인터벌
  useEffect(() => {
    if (autoSync && isOnline) {
      syncIntervalRef.current = setInterval(() => {
        if (pendingCount > 0) {
          console.log('[useNFCSync] 자동 동기화 실행');
          sync();
        }
      }, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [autoSync, isOnline, syncInterval, pendingCount, sync]);

  // 앱 포그라운드 복귀 시 동기화
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isOnline && pendingCount > 0) {
        console.log('[useNFCSync] 앱 활성화 - 동기화 시도');
        sync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isOnline, pendingCount, sync]);

  return {
    isSyncing: storeSyncing,
    pendingCount,
    isOnline,
    lastSyncAt,
    sync,
    saveCheckpoint,
    saveLog,
  };
}

export default useNFCSync;
