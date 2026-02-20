import { useEffect, useCallback, useState } from 'react';
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
import { VideoIntroScreen } from '@/components/VideoIntroScreen';
import { SeniorModeProvider } from '@/contexts/SeniorModeContext';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useNotifications } from '@/hooks/useNotifications';
import config from '@/theme/tamagui.config';
import type { ThemeName } from '@/theme/themes';
import { durations } from '@/theme/tokens';
import { asyncStoragePersister } from '@/api/queryPersister';
import axios from 'axios';
import { registerGlobalToast } from '@/api/globalToast';
import { handleApiError } from '@/api/errorHandler';
import { setupOnlineManager } from '@/api/onlineManager';
import { useNetworkStore } from '@/stores/network.store';
import { startAutoSync } from '@/services/syncService';

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
    mutations: {
      onError: (error) => {
        // Axios 에러는 client.ts 인터셉터에서 handleApiError가 이미 처리.
        // 여기서는 비-Axios 에러(네트워크 무관 로직 에러 등)만 처리한다.
        if (!axios.isAxiosError(error)) {
          handleApiError(error);
        }
      },
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

/**
 * 글로벌 Toast 브릿지
 *
 * ToastProvider 내부에서 useToast를 사용하여
 * globalToast 모듈에 Toast 함수를 등록한다.
 * Axios 인터셉터 등 React 외부에서 Toast를 호출할 수 있게 된다.
 */
function GlobalToastBridge() {
  const toast = useToast();

  useEffect(() => {
    registerGlobalToast((message, variant) => {
      toast.show(message, { variant });
    });
  }, [toast]);

  return null;
}

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const currentTheme = useCurrentTheme();
  const [showIntro, setShowIntro] = useState(true);

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
   * 4. 네트워크 모니터링 시작
   * 5. TanStack Query 온라인 매니저 연동
   * 6. 오프라인 큐 자동 동기화 시작
   */
  const initializeApp = useCallback(async () => {
    try {
      console.log('[RootLayout] 앱 초기화 시작');
      await checkAuth();
      console.log('[RootLayout] 앱 초기화 완료');
    } catch (error) {
      console.error('[RootLayout] 앱 초기화 오류:', error);
    }
  }, [checkAuth]);

  // 네트워크 모니터링 + 온라인 매니저 + 오프라인 큐 자동 동기화
  useEffect(() => {
    const stopNetworkMonitoring = useNetworkStore.getState().startMonitoring();
    const stopOnlineManager = setupOnlineManager();
    const stopAutoSync = startAutoSync();

    return () => {
      stopNetworkMonitoring();
      stopOnlineManager();
      stopAutoSync();
    };
  }, []);

  /**
   * 3D 인트로 완료 후 메인 앱 표시
   */
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      console.log('[RootLayout] Hydration 완료, 초기화 실행');
      initializeApp();
    }
  }, [isHydrated, initializeApp]);

  /**
   * 인트로 화면 표시 시 네이티브 스플래시 숨김
   * (React 렌더가 준비되면 즉시 3D 인트로가 보이도록)
   */
  useEffect(() => {
    if (isHydrated && showIntro) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated, showIntro]);

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

  // 3D 로고 인트로 표시 (앱 킬 시 첫 화면)
  if (showIntro) {
    return (
      <TamaguiProvider config={config} defaultTheme="light">
        <Theme name={currentTheme}>
          <StatusBar style="light" />
          <VideoIntroScreen onComplete={handleIntroComplete} />
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
            <ToastProvider>
              <GlobalToastBridge />
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: durations.screenTransition,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main)" />
              </Stack>
            </ToastProvider>
          </PersistQueryClientProvider>
        </SeniorModeProvider>
      </Theme>
    </TamaguiProvider>
  );
}
