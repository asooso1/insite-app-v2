import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { TamaguiProvider, Theme } from 'tamagui';
import Constants from 'expo-constants';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { SplashScreen as AppSplashScreen } from '@/components/SplashScreen';
import { SeniorModeProvider } from '@/contexts/SeniorModeContext';
import { useNotifications } from '@/hooks/useNotifications';
import config from '@/theme/tamagui.config';
import type { ThemeName } from '@/theme/themes';
import { asyncStoragePersister } from '@/api/queryPersister';

// 앱이 로드되는 동안 네이티브 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

/**
 * TanStack Query 클라이언트 설정
 *
 * gcTime: 24시간으로 설정하여 오프라인 지원 강화
 * - gcTime이 짧으면 캐시가 빨리 삭제되어 persist 효과 감소
 * - 24시간 동안 캐시 유지로 안정적인 오프라인 경험 제공
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분: 데이터 신선도 유지 시간
      gcTime: 1000 * 60 * 60 * 24, // 24시간: 가비지 컬렉션 시간 (오프라인 지원)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * 현재 테마 이름 반환
 * isSeniorMode에 따라 일반 또는 시니어 테마 반환
 *
 * Tamagui의 Theme 컴포넌트와 함께 사용하여 동적 테마 전환 지원
 */
function useCurrentTheme(): ThemeName {
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);
  // TODO: themeMode 지원 시 dark 테마 추가
  // const themeMode = useUIStore((state) => state.themeMode);

  console.log('[useCurrentTheme] 시니어 모드:', isSeniorMode);

  if (isSeniorMode) {
    return 'seniorLight';
  }
  return 'light';
}

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const currentTheme = useCurrentTheme();

  // Expo 프로젝트 ID 가져오기
  const projectId = Constants.expoConfig?.extra?.eas?.projectId || '';

  // 알림 훅 초기화
  const { expoPushToken, permissionStatus } = useNotifications({
    projectId,
    onNotificationReceived: (notification) => {
      console.log('[RootLayout] 알림 수신:', notification.request.content.title);
    },
    onNotificationClick: (response) => {
      console.log('[RootLayout] 알림 클릭:', response.notification.request.content.title);
    },
  });

  /**
   * 앱 초기화 작업
   * 1. Zustand persist middleware가 자동으로 인증 상태 복원 (hydrate)
   * 2. 토큰 유효성 검증 (checkAuth)
   * 3. 알림 초기화 (useNotifications 훅이 자동 처리)
   * 4. 스플래시 화면 숨김
   */
  const initializeApp = useCallback(async () => {
    try {
      console.log('[RootLayout] 앱 초기화 시작');

      // 토큰 유효성 검증 (필요 시 refresh)
      await checkAuth();

      console.log('[RootLayout] 앱 초기화 완료');

      // 스플래시 화면 숨김
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('[RootLayout] 앱 초기화 오류:', error);
      // 오류가 있어도 스플래시 화면은 숨김
      await SplashScreen.hideAsync();
    }
  }, [checkAuth]);

  useEffect(() => {
    if (isHydrated) {
      console.log('[RootLayout] Hydration 완료, 초기화 실행');
      initializeApp();
    }
  }, [isHydrated, initializeApp]);

  /**
   * 푸시 토큰 등록
   * - 토큰이 발급되면 서버에 등록 (TODO)
   */
  useEffect(() => {
    if (expoPushToken) {
      console.log('[RootLayout] Expo Push Token 발급됨:', expoPushToken);

      // TODO: 서버에 푸시 토큰 등록
      // registerPushTokenToServer(expoPushToken)
      //   .then(() => console.log('[RootLayout] 푸시 토큰 등록 완료'))
      //   .catch((error) => console.error('[RootLayout] 푸시 토큰 등록 실패:', error));
    }
  }, [expoPushToken]);

  /**
   * 알림 권한 상태 로깅
   */
  useEffect(() => {
    if (permissionStatus) {
      console.log('[RootLayout] 알림 권한 상태:', permissionStatus.status);
    }
  }, [permissionStatus]);

  // 초기화가 완료되지 않았으면 커스텀 스플래시 화면 표시
  if (!isHydrated) {
    return (
      <TamaguiProvider config={config} defaultTheme="light">
        <Theme name={currentTheme}>
          <AppSplashScreen showMessage message="앱을 준비하고 있습니다..." />
        </Theme>
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {/* Theme 컴포넌트로 동적 테마 전환 - currentTheme이 변경되면 자동으로 반영 */}
      <Theme name={currentTheme}>
        <SeniorModeProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}
          >
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(main)" />
            </Stack>
          </PersistQueryClientProvider>
        </SeniorModeProvider>
      </Theme>
    </TamaguiProvider>
  );
}
