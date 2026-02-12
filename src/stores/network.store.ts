/**
 * 네트워크 상태 관리 스토어
 *
 * 온라인/오프라인 상태 감지 및 관리
 * expo-network 사용 (개발빌드 필요)
 */
import { create } from 'zustand';
import * as Network from 'expo-network';
import { AppState, AppStateStatus } from 'react-native';

interface NetworkState {
  // State
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: Network.NetworkStateType | null;
  lastCheckedAt: number | null;

  // Actions
  updateNetworkState: () => Promise<void>;
  setOnline: (online: boolean) => void;
  startMonitoring: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  // Initial State (낙관적으로 온라인 가정)
  isConnected: true,
  isInternetReachable: true,
  connectionType: null,
  lastCheckedAt: null,

  // Actions
  setOnline: (online: boolean) => {
    set({
      isConnected: online,
      isInternetReachable: online,
      lastCheckedAt: Date.now(),
    });
  },

  updateNetworkState: async () => {
    try {
      const state = await Network.getNetworkStateAsync();

      const prevState = get();
      const wasOffline = !prevState.isConnected || !prevState.isInternetReachable;
      const isNowOnline = (state.isConnected ?? false) && (state.isInternetReachable ?? false);

      set({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        connectionType: state.type,
        lastCheckedAt: Date.now(),
      });

      // 상태 변경 로그
      if (wasOffline !== !isNowOnline) {
        console.log('[Network] 상태 변경:', isNowOnline ? '온라인' : '오프라인', state.type);
      }
    } catch (error) {
      console.error('[Network] 상태 조회 실패:', error);
      set({
        isConnected: false,
        isInternetReachable: false,
        lastCheckedAt: Date.now(),
      });
    }
  },

  startMonitoring: () => {
    console.log('[Network] 네트워크 모니터링 시작');

    // 초기 상태 확인
    get().updateNetworkState();

    // AppState 변경 시 네트워크 상태 재확인
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        get().updateNetworkState();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 주기적 체크 (30초마다)
    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        get().updateNetworkState();
      }
    }, 30000);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  },
}));

/**
 * 현재 온라인 상태 확인 (동기 - 캐시된 상태)
 */
export const isOnline = (): boolean => {
  const { isConnected, isInternetReachable } = useNetworkStore.getState();
  return isConnected && isInternetReachable;
};

/**
 * 현재 온라인 상태 확인 (비동기 - 실시간 상태)
 */
export const checkOnlineStatus = async (): Promise<boolean> => {
  try {
    const state = await Network.getNetworkStateAsync();
    return (state.isConnected ?? false) && (state.isInternetReachable ?? false);
  } catch {
    return false;
  }
};
