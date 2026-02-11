/**
 * 화면 지연 로딩 유틸리티
 *
 * React.lazy와 Suspense를 활용한 컴포넌트 지연 로딩
 * Expo Router의 파일 기반 라우팅 제약으로 인해
 * 화면 내부의 무거운 컴포넌트들을 lazy loading하는 데 사용
 *
 * 사용 예시:
 * - 차트 컴포넌트 (DonutChart, BarChart)
 * - 복잡한 모달 컴포넌트
 * - 대시보드 위젯
 */

import React, { ComponentType, Suspense, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { YStack, Text } from 'tamagui';

/**
 * 지연 로딩 옵션
 */
interface LazyLoadOptions {
  /** 로딩 중 표시할 컴포넌트 */
  fallback?: ReactNode;
  /** 에러 발생 시 표시할 컴포넌트 */
  errorFallback?: ReactNode;
  /** 최소 로딩 시간 (ms) - 로딩 표시가 너무 빠르게 깜빡이는 것 방지 */
  minLoadingTime?: number;
}

/**
 * 기본 로딩 폴백 컴포넌트
 */
function DefaultLoadingFallback(): React.ReactElement {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$white"
      padding="$4"
    >
      <ActivityIndicator size="large" color="#0066CC" />
      <Text fontSize={14} color="$gray500" marginTop="$3">
        로딩 중...
      </Text>
    </YStack>
  );
}

/**
 * 기본 에러 폴백 컴포넌트
 */
function DefaultErrorFallback(): React.ReactElement {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$white"
      padding="$4"
    >
      <Text fontSize={16} fontWeight="600" color="$error" marginBottom="$2">
        컴포넌트 로딩 실패
      </Text>
      <Text fontSize={14} color="$gray500" textAlign="center">
        컴포넌트를 불러오는 중 오류가 발생했습니다.
      </Text>
    </YStack>
  );
}

/**
 * 컴포넌트를 지연 로딩하는 래퍼 함수
 *
 * @template T - 컴포넌트 Props 타입
 * @param importFn - 동적 import 함수 (예: () => import('./Component'))
 * @param options - 지연 로딩 옵션
 * @returns Suspense와 ErrorBoundary로 감싸진 컴포넌트
 *
 * @example
 * ```tsx
 * // 차트 컴포넌트 지연 로딩
 * const LazyDonutChart = lazyLoad<DonutChartProps>(
 *   () => import('@/features/dashboard/components/DonutChart'),
 *   { minLoadingTime: 300 }
 * );
 *
 * // 사용
 * <LazyDonutChart title="작업 현황" segments={segments} />
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions = {}
): ComponentType<T> {
  const {
    fallback = <DefaultLoadingFallback />,
    errorFallback = <DefaultErrorFallback />,
    minLoadingTime = 0,
  } = options;

  // 최소 로딩 시간을 보장하는 import 함수
  const importWithMinDelay = async () => {
    const startTime = Date.now();
    const module = await importFn();
    const elapsed = Date.now() - startTime;

    if (minLoadingTime > 0 && elapsed < minLoadingTime) {
      await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsed));
    }

    return module;
  };

  const LazyComponent = React.lazy(importWithMinDelay);

  // ErrorBoundary로 감싸진 컴포넌트
  const WrappedComponent: ComponentType<T> = (props: T) => (
    <LazyErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...(props as T & Record<string, unknown>)} />
      </Suspense>
    </LazyErrorBoundary>
  );

  // displayName 설정 (디버깅 용이성)
  WrappedComponent.displayName = 'LazyLoaded(Component)';

  return WrappedComponent;
}

/**
 * 간단한 ErrorBoundary 컴포넌트
 */
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class LazyErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 에러 로깅 (프로덕션에서는 Sentry 등으로 전송)
    console.error('LazyLoad Error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * 미니멀한 로딩 스피너 (인라인 사용)
 */
export function InlineLoadingFallback(): React.ReactElement {
  return (
    <View style={styles.inlineLoading}>
      <ActivityIndicator size="small" color="#0066CC" />
    </View>
  );
}

/**
 * 카드 스켈레톤 로딩 (카드 형태 컴포넌트용)
 */
export function CardSkeletonFallback(): React.ReactElement {
  return (
    <YStack
      backgroundColor="$white"
      borderRadius="$5"
      padding="$4"
      borderWidth={1}
      borderColor="$gray200"
      gap="$3"
    >
      <View style={[styles.skeleton, styles.skeletonTitle]} />
      <View style={[styles.skeleton, styles.skeletonLine]} />
      <View style={[styles.skeleton, styles.skeletonLine, { width: '60%' }]} />
    </YStack>
  );
}

const styles = StyleSheet.create({
  inlineLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  skeleton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  skeletonTitle: {
    height: 24,
    width: '40%',
  },
  skeletonLine: {
    height: 16,
    width: '100%',
  },
});

/**
 * 사용 예시 타입 (참고용)
 *
 * @example
 * ```tsx
 * // 1. 차트 컴포넌트 지연 로딩
 * const LazyDonutChart = lazyLoad<DonutChartProps>(
 *   () => import('@/features/dashboard/components/DonutChart')
 * );
 *
 * const LazyBarChart = lazyLoad<BarChartProps>(
 *   () => import('@/features/dashboard/components/BarChart'),
 *   { fallback: <CardSkeletonFallback /> }
 * );
 *
 * // 2. 사용
 * function Dashboard() {
 *   return (
 *     <YStack>
 *       <LazyDonutChart title="작업 현황" segments={segments} />
 *       <LazyBarChart title="층별 진행률" items={items} />
 *     </YStack>
 *   );
 * }
 * ```
 */
