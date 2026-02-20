/**
 * Offline Queue Store 단위 테스트
 */
import { useOfflineQueueStore } from '../offlineQueue.store';

describe('offlineQueue.store', () => {
  beforeEach(() => {
    useOfflineQueueStore.setState({
      queue: [],
      isSyncing: false,
      lastSyncAt: null,
    });
  });

  describe('addToQueue', () => {
    it('큐에 항목을 추가하고 ID를 반환한다', () => {
      const id = useOfflineQueueStore.getState().addToQueue('ATTENDANCE_CHECK_IN', {
        latitude: 37.5665,
        longitude: 126.978,
      });

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');

      const queue = useOfflineQueueStore.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject({
        id,
        type: 'ATTENDANCE_CHECK_IN',
        payload: { latitude: 37.5665, longitude: 126.978 },
        retryCount: 0,
        maxRetries: 3,
      });
    });

    it('여러 항목을 순서대로 추가한다', () => {
      useOfflineQueueStore.getState().addToQueue('ATTENDANCE_CHECK_IN', { ts: 1 });
      useOfflineQueueStore.getState().addToQueue('PATROL_CHECKPOINT', { ts: 2 });
      useOfflineQueueStore.getState().addToQueue('SCAN_LOG', { ts: 3 });

      const queue = useOfflineQueueStore.getState().queue;
      expect(queue).toHaveLength(3);
      expect(queue[0]?.type).toBe('ATTENDANCE_CHECK_IN');
      expect(queue[1]?.type).toBe('PATROL_CHECKPOINT');
      expect(queue[2]?.type).toBe('SCAN_LOG');
    });
  });

  describe('removeFromQueue', () => {
    it('ID로 큐에서 항목을 제거한다', () => {
      const id = useOfflineQueueStore.getState().addToQueue('ATTENDANCE_CHECK_IN', {});

      useOfflineQueueStore.getState().removeFromQueue(id);

      expect(useOfflineQueueStore.getState().queue).toHaveLength(0);
    });

    it('존재하지 않는 ID 제거 시 큐가 변하지 않는다', () => {
      useOfflineQueueStore.getState().addToQueue('ATTENDANCE_CHECK_IN', {});

      useOfflineQueueStore.getState().removeFromQueue('non-existent-id');

      expect(useOfflineQueueStore.getState().queue).toHaveLength(1);
    });
  });

  describe('incrementRetry', () => {
    it('항목의 retryCount를 증가시킨다', () => {
      const id = useOfflineQueueStore.getState().addToQueue('PATROL_CHECKPOINT', {});

      useOfflineQueueStore.getState().incrementRetry(id);
      useOfflineQueueStore.getState().incrementRetry(id);

      const item = useOfflineQueueStore.getState().queue[0];
      expect(item?.retryCount).toBe(2);
    });
  });

  describe('clearQueue', () => {
    it('큐를 완전히 비운다', () => {
      useOfflineQueueStore.getState().addToQueue('ATTENDANCE_CHECK_IN', {});
      useOfflineQueueStore.getState().addToQueue('PATROL_CHECKPOINT', {});
      expect(useOfflineQueueStore.getState().queue).toHaveLength(2);

      useOfflineQueueStore.getState().clearQueue();

      expect(useOfflineQueueStore.getState().queue).toHaveLength(0);
    });
  });

  describe('setSyncing', () => {
    it('동기화 상태를 설정한다', () => {
      useOfflineQueueStore.getState().setSyncing(true);
      expect(useOfflineQueueStore.getState().isSyncing).toBe(true);

      useOfflineQueueStore.getState().setSyncing(false);
      expect(useOfflineQueueStore.getState().isSyncing).toBe(false);
    });
  });

  describe('setLastSyncAt', () => {
    it('마지막 동기화 시각을 설정한다', () => {
      const now = Date.now();
      useOfflineQueueStore.getState().setLastSyncAt(now);

      expect(useOfflineQueueStore.getState().lastSyncAt).toBe(now);
    });
  });

  describe('getQueueByType', () => {
    it('타입별로 큐 항목을 필터링한다', () => {
      useOfflineQueueStore.getState().addToQueue('ATTENDANCE_CHECK_IN', { a: 1 });
      useOfflineQueueStore.getState().addToQueue('PATROL_CHECKPOINT', { b: 2 });
      useOfflineQueueStore.getState().addToQueue('ATTENDANCE_CHECK_IN', { c: 3 });

      const checkInItems = useOfflineQueueStore.getState().getQueueByType('ATTENDANCE_CHECK_IN');
      expect(checkInItems).toHaveLength(2);

      const patrolItems = useOfflineQueueStore.getState().getQueueByType('PATROL_CHECKPOINT');
      expect(patrolItems).toHaveLength(1);

      const scanItems = useOfflineQueueStore.getState().getQueueByType('SCAN_LOG');
      expect(scanItems).toHaveLength(0);
    });
  });
});
