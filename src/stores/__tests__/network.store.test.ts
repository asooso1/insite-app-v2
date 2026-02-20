/**
 * Network Store 단위 테스트
 */
import * as Network from 'expo-network';
import { useNetworkStore, isOnline, checkOnlineStatus } from '../network.store';

const mockGetNetworkStateAsync = Network.getNetworkStateAsync as jest.Mock;

describe('network.store', () => {
  beforeEach(() => {
    useNetworkStore.setState({
      isConnected: true,
      isInternetReachable: true,
      connectionType: null,
      lastCheckedAt: null,
    });
    jest.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('낙관적으로 온라인 상태를 가정한다', () => {
      const state = useNetworkStore.getState();

      expect(state.isConnected).toBe(true);
      expect(state.isInternetReachable).toBe(true);
    });

    it('connectionType이 null이다', () => {
      expect(useNetworkStore.getState().connectionType).toBeNull();
    });

    it('lastCheckedAt이 null이다', () => {
      expect(useNetworkStore.getState().lastCheckedAt).toBeNull();
    });
  });

  describe('setOnline', () => {
    it('온라인 상태를 설정한다', () => {
      useNetworkStore.getState().setOnline(true);

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(true);
      expect(state.isInternetReachable).toBe(true);
      expect(state.lastCheckedAt).not.toBeNull();
    });

    it('오프라인 상태를 설정한다', () => {
      useNetworkStore.getState().setOnline(false);

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(false);
      expect(state.isInternetReachable).toBe(false);
    });

    it('lastCheckedAt 타임스탬프를 업데이트한다', () => {
      const before = Date.now();
      useNetworkStore.getState().setOnline(true);
      const after = Date.now();

      const { lastCheckedAt } = useNetworkStore.getState();
      expect(lastCheckedAt).toBeGreaterThanOrEqual(before);
      expect(lastCheckedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('updateNetworkState', () => {
    it('네트워크 상태를 조회하여 업데이트한다', async () => {
      mockGetNetworkStateAsync.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });

      await useNetworkStore.getState().updateNetworkState();

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(true);
      expect(state.isInternetReachable).toBe(true);
      expect(state.connectionType).toBe('wifi');
      expect(state.lastCheckedAt).not.toBeNull();
    });

    it('오프라인 상태를 감지한다', async () => {
      mockGetNetworkStateAsync.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      await useNetworkStore.getState().updateNetworkState();

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(false);
      expect(state.isInternetReachable).toBe(false);
    });

    it('API 실패 시 오프라인으로 처리한다', async () => {
      mockGetNetworkStateAsync.mockRejectedValue(new Error('Network error'));

      await useNetworkStore.getState().updateNetworkState();

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(false);
      expect(state.isInternetReachable).toBe(false);
      expect(state.lastCheckedAt).not.toBeNull();
    });

    it('null 응답값을 false로 처리한다', async () => {
      mockGetNetworkStateAsync.mockResolvedValue({
        isConnected: null,
        isInternetReachable: null,
        type: 'unknown',
      });

      await useNetworkStore.getState().updateNetworkState();

      const state = useNetworkStore.getState();
      expect(state.isConnected).toBe(false);
      expect(state.isInternetReachable).toBe(false);
    });
  });

  describe('isOnline (헬퍼 함수)', () => {
    it('연결됨 + 인터넷 가능이면 true를 반환한다', () => {
      useNetworkStore.setState({ isConnected: true, isInternetReachable: true });

      expect(isOnline()).toBe(true);
    });

    it('연결 안됨이면 false를 반환한다', () => {
      useNetworkStore.setState({ isConnected: false, isInternetReachable: true });

      expect(isOnline()).toBe(false);
    });

    it('인터넷 불가이면 false를 반환한다', () => {
      useNetworkStore.setState({ isConnected: true, isInternetReachable: false });

      expect(isOnline()).toBe(false);
    });

    it('둘 다 false이면 false를 반환한다', () => {
      useNetworkStore.setState({ isConnected: false, isInternetReachable: false });

      expect(isOnline()).toBe(false);
    });
  });

  describe('checkOnlineStatus (비동기)', () => {
    it('온라인이면 true를 반환한다', async () => {
      mockGetNetworkStateAsync.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const result = await checkOnlineStatus();

      expect(result).toBe(true);
    });

    it('오프라인이면 false를 반환한다', async () => {
      mockGetNetworkStateAsync.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const result = await checkOnlineStatus();

      expect(result).toBe(false);
    });

    it('에러 시 false를 반환한다', async () => {
      mockGetNetworkStateAsync.mockRejectedValue(new Error('fail'));

      const result = await checkOnlineStatus();

      expect(result).toBe(false);
    });

    it('isConnected만 true여도 isInternetReachable이 false면 false', async () => {
      mockGetNetworkStateAsync.mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
      });

      const result = await checkOnlineStatus();

      expect(result).toBe(false);
    });
  });
});
