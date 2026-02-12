/**
 * NFC 스캔 결과 동기화 서비스
 *
 * 오프라인 상태에서 NFC 스캔 결과를 로컬에 저장하고
 * 네트워크 복구 시 자동으로 서버에 동기화
 */
import { useOfflineQueueStore, QueueItem } from '@/stores/offlineQueue.store';
import { checkOnlineStatus } from '@/stores/network.store';
import { CheckpointNFCData } from '@/hooks/useNFC';

export interface PatrolCheckpointPayload {
  /** 순찰 ID */
  patrolId: string;
  /** 구역 ID */
  zoneId: string;
  /** 체크포인트 ID */
  checkpointId: string;
  /** NFC 태그 ID */
  tagId: string;
  /** 빌딩 ID */
  buildingId?: string;
  /** 층 ID */
  floorId?: string;
  /** 스캔 시간 */
  scannedAt: number;
  /** 위도 (선택) */
  latitude?: number;
  /** 경도 (선택) */
  longitude?: number;
  /** 메모 */
  memo?: string;
}

export interface ScanLogPayload {
  /** 태그 ID */
  tagId: string;
  /** 스캔 타입 */
  scanType: 'guest_login' | 'patrol' | 'equipment' | 'general';
  /** 추가 데이터 */
  data?: Record<string, unknown>;
  /** 스캔 시간 */
  scannedAt: number;
}

/**
 * 순찰 체크포인트 스캔 결과 저장 (오프라인 지원)
 */
export const savePatrolCheckpoint = async (
  payload: PatrolCheckpointPayload
): Promise<{ success: boolean; queueId?: string; error?: string }> => {
  const { addToQueue } = useOfflineQueueStore.getState();

  try {
    const online = await checkOnlineStatus();

    if (online) {
      // 온라인: 바로 API 호출
      // TODO: 실제 API 연동
      // const response = await submitPatrolCheckpoint(payload);
      console.log('[NFCSync] 온라인 - 순찰 체크포인트 저장:', payload.checkpointId);

      // 임시: API 호출 성공 가정
      return { success: true };
    } else {
      // 오프라인: 큐에 저장
      const queueId = addToQueue('PATROL_CHECKPOINT', payload as unknown as Record<string, unknown>);
      console.log('[NFCSync] 오프라인 - 큐에 저장:', queueId);

      return { success: true, queueId };
    }
  } catch (error) {
    console.error('[NFCSync] 순찰 체크포인트 저장 실패:', error);

    // 실패 시 큐에 저장
    const queueId = addToQueue('PATROL_CHECKPOINT', payload as unknown as Record<string, unknown>);

    return {
      success: false,
      queueId,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
};

/**
 * 스캔 로그 저장 (오프라인 지원)
 */
export const saveScanLog = async (
  payload: ScanLogPayload
): Promise<{ success: boolean; queueId?: string; error?: string }> => {
  const { addToQueue } = useOfflineQueueStore.getState();

  try {
    const online = await checkOnlineStatus();

    if (online) {
      // 온라인: 바로 API 호출
      // TODO: 실제 API 연동
      console.log('[NFCSync] 온라인 - 스캔 로그 저장:', payload.tagId);

      return { success: true };
    } else {
      // 오프라인: 큐에 저장
      const queueId = addToQueue('SCAN_LOG', payload as unknown as Record<string, unknown>);
      console.log('[NFCSync] 오프라인 - 스캔 로그 큐에 저장:', queueId);

      return { success: true, queueId };
    }
  } catch (error) {
    console.error('[NFCSync] 스캔 로그 저장 실패:', error);

    const queueId = addToQueue('SCAN_LOG', payload as unknown as Record<string, unknown>);

    return {
      success: false,
      queueId,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
};

/**
 * NFC 데이터를 순찰 체크포인트 페이로드로 변환
 */
export const nfcDataToCheckpointPayload = (
  nfcData: CheckpointNFCData,
  patrolId: string,
  zoneId: string,
  options?: {
    latitude?: number;
    longitude?: number;
    memo?: string;
  }
): PatrolCheckpointPayload => {
  return {
    patrolId,
    zoneId,
    checkpointId: nfcData.checkpointId || nfcData.tagId,
    tagId: nfcData.tagId,
    buildingId: nfcData.buildingId || undefined,
    floorId: nfcData.floorId || undefined,
    scannedAt: Date.now(),
    latitude: options?.latitude,
    longitude: options?.longitude,
    memo: options?.memo,
  };
};

/**
 * 오프라인 큐 동기화 실행
 */
export const syncOfflineQueue = async (): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> => {
  const {
    queue,
    removeFromQueue,
    incrementRetry,
    setSyncing,
    setLastSyncAt,
    getQueueByType,
  } = useOfflineQueueStore.getState();

  if (queue.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  const online = await checkOnlineStatus();
  if (!online) {
    console.log('[NFCSync] 오프라인 상태 - 동기화 건너뜀');
    return { synced: 0, failed: 0, remaining: queue.length };
  }

  setSyncing(true);
  console.log('[NFCSync] 동기화 시작:', queue.length, '개 항목');

  let synced = 0;
  let failed = 0;

  // PATROL_CHECKPOINT 동기화
  const checkpointItems = getQueueByType('PATROL_CHECKPOINT');
  for (const item of checkpointItems) {
    try {
      // TODO: 실제 API 호출
      // const response = await submitPatrolCheckpoint(item.payload as PatrolCheckpointPayload);

      console.log('[NFCSync] 체크포인트 동기화 성공:', item.id);
      removeFromQueue(item.id);
      synced++;
    } catch (error) {
      console.error('[NFCSync] 체크포인트 동기화 실패:', item.id, error);

      if (item.retryCount >= item.maxRetries) {
        console.log('[NFCSync] 최대 재시도 초과, 항목 제거:', item.id);
        removeFromQueue(item.id);
        failed++;
      } else {
        incrementRetry(item.id);
      }
    }
  }

  // SCAN_LOG 동기화
  const scanLogItems = getQueueByType('SCAN_LOG');
  for (const item of scanLogItems) {
    try {
      // TODO: 실제 API 호출
      console.log('[NFCSync] 스캔 로그 동기화 성공:', item.id);
      removeFromQueue(item.id);
      synced++;
    } catch (error) {
      console.error('[NFCSync] 스캔 로그 동기화 실패:', item.id, error);

      if (item.retryCount >= item.maxRetries) {
        removeFromQueue(item.id);
        failed++;
      } else {
        incrementRetry(item.id);
      }
    }
  }

  const remaining = useOfflineQueueStore.getState().queue.length;

  setSyncing(false);
  setLastSyncAt(Date.now());

  console.log('[NFCSync] 동기화 완료:', { synced, failed, remaining });

  return { synced, failed, remaining };
};

/**
 * 대기 중인 NFC 스캔 결과 개수 조회
 */
export const getPendingNFCScansCount = (): number => {
  const { queue } = useOfflineQueueStore.getState();
  return queue.filter(
    (item) => item.type === 'PATROL_CHECKPOINT' || item.type === 'SCAN_LOG'
  ).length;
};

/**
 * 대기 중인 순찰 체크포인트 조회
 */
export const getPendingPatrolCheckpoints = (patrolId?: string): QueueItem[] => {
  const { getQueueByType } = useOfflineQueueStore.getState();
  const items = getQueueByType('PATROL_CHECKPOINT');

  if (patrolId) {
    return items.filter(
      (item) => (item.payload as unknown as PatrolCheckpointPayload).patrolId === patrolId
    );
  }

  return items;
};
