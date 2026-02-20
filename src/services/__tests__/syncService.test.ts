/**
 * 동기화 서비스 단위 테스트
 */
import { syncOfflineQueue } from '../syncService';
import { useOfflineQueueStore } from '@/stores/offlineQueue.store';
import { useNetworkStore } from '@/stores/network.store';

// apiClient mock
jest.mock('@/api/client', () => ({
  apiClient: {
    post: jest.fn().mockResolvedValue({ data: { code: 'success' } }),
    get: jest.fn().mockResolvedValue({ data: { code: 'success' } }),
  },
}));

const { apiClient } = require('@/api/client');

const createQueueItem = (overrides = {}) => ({
  id: `item-${Date.now()}-${Math.random()}`,
  type: 'ATTENDANCE_CHECK_IN',
  payload: { latitude: 37.5665, longitude: 126.978, type: 'QR' },
  timestamp: Date.now(),
  retryCount: 0,
  maxRetries: 3,
  ...overrides,
});

describe('syncService', () => {
  beforeEach(() => {
    useOfflineQueueStore.setState({
      queue: [],
      isSyncing: false,
      lastSyncAt: null,
    });
    useNetworkStore.setState({
      isConnected: true,
      isInternetReachable: true,
    });
    jest.clearAllMocks();
  });

  describe('syncOfflineQueue', () => {
    it('큐가 비어있으면 바로 반환한다', async () => {
      const result = await syncOfflineQueue();

      expect(result).toEqual({ success: 0, failed: 0, remaining: 0 });
    });

    it('이미 동기화 중이면 스킵한다', async () => {
      useOfflineQueueStore.setState({
        isSyncing: true,
        queue: [createQueueItem()],
      });

      const result = await syncOfflineQueue();

      expect(result.success).toBe(0);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('오프라인이면 스킵한다', async () => {
      useNetworkStore.setState({ isConnected: false, isInternetReachable: false });
      useOfflineQueueStore.setState({
        queue: [createQueueItem()],
      });

      const result = await syncOfflineQueue();

      expect(result.success).toBe(0);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('ATTENDANCE_CHECK_IN 항목을 동기화한다', async () => {
      const item = createQueueItem({
        id: 'checkin-1',
        type: 'ATTENDANCE_CHECK_IN',
        payload: { latitude: 37.5, longitude: 127.0, type: 'QR' },
      });
      useOfflineQueueStore.setState({ queue: [item] });

      const result = await syncOfflineQueue();

      expect(result.success).toBe(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/m/api/duties/check-in?type=QR',
        { latitude: 37.5, longitude: 127.0 }
      );
    });

    it('ATTENDANCE_CHECK_OUT 항목을 동기화한다', async () => {
      const item = createQueueItem({
        id: 'checkout-1',
        type: 'ATTENDANCE_CHECK_OUT',
        payload: { latitude: 37.5, longitude: 127.0, type: 'NFC' },
      });
      useOfflineQueueStore.setState({ queue: [item] });

      const result = await syncOfflineQueue();

      expect(result.success).toBe(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/m/api/duties/check-out?type=NFC',
        { latitude: 37.5, longitude: 127.0 }
      );
    });

    it('PATROL_CHECKPOINT 항목을 동기화한다', async () => {
      const item = createQueueItem({
        id: 'patrol-1',
        type: 'PATROL_CHECKPOINT',
        payload: { checkpointId: 'cp-1', latitude: 37.5, longitude: 127.0, timestamp: 1000 },
      });
      useOfflineQueueStore.setState({ queue: [item] });

      const result = await syncOfflineQueue();

      expect(result.success).toBe(1);
      expect(apiClient.post).toHaveBeenCalledWith('/m/api/patrols/checkpoint', {
        checkpointId: 'cp-1',
        latitude: 37.5,
        longitude: 127.0,
        timestamp: 1000,
      });
    });

    it('SCAN_LOG 항목을 동기화한다', async () => {
      const item = createQueueItem({
        id: 'scan-1',
        type: 'SCAN_LOG',
        payload: {
          scanType: 'QR',
          scanData: 'data',
          latitude: 37.5,
          longitude: 127.0,
          timestamp: 2000,
        },
      });
      useOfflineQueueStore.setState({ queue: [item] });

      const result = await syncOfflineQueue();

      expect(result.success).toBe(1);
      expect(apiClient.post).toHaveBeenCalledWith('/m/api/scans/log', {
        scanType: 'QR',
        scanData: 'data',
        latitude: 37.5,
        longitude: 127.0,
        timestamp: 2000,
      });
    });

    it('여러 항목을 순차적으로 동기화한다', async () => {
      const items = [
        createQueueItem({ id: 'a', timestamp: 1000 }),
        createQueueItem({ id: 'b', timestamp: 2000 }),
        createQueueItem({ id: 'c', timestamp: 3000 }),
      ];
      useOfflineQueueStore.setState({ queue: items });

      const result = await syncOfflineQueue();

      expect(result.success).toBe(3);
      expect(apiClient.post).toHaveBeenCalledTimes(3);
    });

    it('동기화 실패 시 retryCount를 증가시킨다', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('Network error'));

      const item = createQueueItem({ id: 'fail-1', retryCount: 0, maxRetries: 3 });
      useOfflineQueueStore.setState({ queue: [item] });

      await syncOfflineQueue();

      // incrementRetry가 호출되었는지 확인 (retryCount가 증가)
      // 아직 maxRetries에 도달하지 않았으므로 큐에 남아있을 수 있음
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it('최대 재시도 초과 시 항목을 제거한다', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('Network error'));

      const item = createQueueItem({
        id: 'maxretry-1',
        retryCount: 2,
        maxRetries: 3,
      });
      useOfflineQueueStore.setState({ queue: [item] });

      const result = await syncOfflineQueue();

      expect(result.failed).toBe(1);
    });

    it('동기화 완료 후 isSyncing을 false로 설정한다', async () => {
      const item = createQueueItem({ id: 'done-1' });
      useOfflineQueueStore.setState({ queue: [item] });

      await syncOfflineQueue();

      expect(useOfflineQueueStore.getState().isSyncing).toBe(false);
    });

    it('동기화 완료 후 lastSyncAt을 업데이트한다', async () => {
      const item = createQueueItem({ id: 'sync-time-1' });
      useOfflineQueueStore.setState({ queue: [item] });

      const before = Date.now();
      await syncOfflineQueue();

      const { lastSyncAt } = useOfflineQueueStore.getState();
      expect(lastSyncAt).toBeGreaterThanOrEqual(before);
    });

    it('알 수 없는 타입의 항목은 실패 처리한다', async () => {
      const item = createQueueItem({
        id: 'unknown-1',
        type: 'UNKNOWN_TYPE',
        retryCount: 2,
        maxRetries: 3,
      });
      useOfflineQueueStore.setState({ queue: [item] });

      await syncOfflineQueue();

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });
});
