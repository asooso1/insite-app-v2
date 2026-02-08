import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { TamaguiProvider } from 'tamagui';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { SplashScreen as AppSplashScreen } from '@/components/SplashScreen';
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
 */
function useCurrentTheme(): ThemeName {
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);
  // TODO: themeMode 지원 시 dark 테마 추가
  // const themeMode = useUIStore((state) => state.themeMode);

  if (isSeniorMode) {
    return 'seniorLight';
  }
  return 'light';
}

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const currentTheme = useCurrentTheme();

  /**
   * 앱 초기화 작업
   * 1. 인증 상태 복원 (hydrate)
   * 2. 토큰 유효성 검증 (checkAuth)
   * 3. 스플래시 화면 숨김
   */
  const initializeApp = useCallback(async () => {
    try {
      // 1. 인증 상태 복원
      hydrate();

      // 2. 토큰 유효성 검증
      await checkAuth();

      // 3. 스플래시 화면 숨김
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('앱 초기화 오류:', error);
      // 오류가 있어도 스플래시 화면은 숨김
      await SplashScreen.hideAsync();
    }
  }, [hydrate, checkAuth]);

  useEffect(() => {
    if (isHydrated) {
      initializeApp();
    }
  }, [isHydrated, initializeApp]);

  // 초기화가 완료되지 않았으면 커스텀 스플래시 화면 표시
  if (!isHydrated) {
    return (
      <TamaguiProvider config={config} defaultTheme={currentTheme}>
        <AppSplashScreen showMessage message="앱을 준비하고 있습니다..." />
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={config} defaultTheme={currentTheme}>
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
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </PersistQueryClientProvider>
    </TamaguiProvider>
  );
}
