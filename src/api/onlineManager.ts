/**
 * TanStack Query 온라인 매니저 설정
 *
 * 네트워크 상태에 따라 쿼리/뮤테이션 동작을 자동 제어:
 * - 오프라인: 쿼리 자동 일시중지, 캐시 데이터 반환
 * - 온라인 복귀: 일시중지된 쿼리 자동 재시도
 */
import { onlineManager } from '@tanstack/react-query';
import { useNetworkStore } from '@/stores/network.store';

/**
 * TanStack Query의 onlineManager를 네트워크 스토어와 연동
 *
 * _layout.tsx에서 앱 시작 시 한 번 호출
 */
export function setupOnlineManager(): () => void {
  // 초기 상태 설정
  const { isConnected, isInternetReachable } = useNetworkStore.getState();
  onlineManager.setOnline(isConnected && isInternetReachable);

  // 네트워크 상태 변경 구독
  const unsubscribe = useNetworkStore.subscribe((state) => {
    const isOnline = state.isConnected && state.isInternetReachable;
    const currentOnline = onlineManager.isOnline();

    if (isOnline !== currentOnline) {
      console.log('[OnlineManager] 상태 변경:', isOnline ? '온라인' : '오프라인');
      onlineManager.setOnline(isOnline);
    }
  });

  return unsubscribe;
}
