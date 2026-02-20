/**
 * 세션 타임아웃 훅
 *
 * 앱이 30분 이상 백그라운드에 있다가 복귀하면 자동 로그아웃
 * AppState 변경 감지 -> background 진입 시각 기록 -> active 복귀 시 경과 시간 확인
 */
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { SESSION_TIMEOUT_MS } from '@/constants/config';

/**
 * 세션 타임아웃 훅
 *
 * app/(main)/_layout.tsx에서 호출하여 인증 영역 전체에 적용
 */
export function useSessionTimeout(): void {
  // 백그라운드 진입 시각 (null이면 포그라운드 상태)
  const backgroundedAtRef = useRef<number | null>(null);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // 백그라운드 진입 시각 기록
        backgroundedAtRef.current = Date.now();
        console.log('[SessionTimeout] 백그라운드 진입:', backgroundedAtRef.current);
      } else if (nextAppState === 'active') {
        // 포그라운드 복귀 시 경과 시간 확인
        if (backgroundedAtRef.current !== null) {
          const elapsed = Date.now() - backgroundedAtRef.current;
          console.log('[SessionTimeout] 포그라운드 복귀, 경과 시간(ms):', elapsed);

          if (elapsed >= SESSION_TIMEOUT_MS) {
            console.log('[SessionTimeout] 세션 타임아웃 -> 로그아웃');
            logout();
          }

          backgroundedAtRef.current = null;
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [logout]);
}
