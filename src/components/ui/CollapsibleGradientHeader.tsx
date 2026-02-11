/**
 * CollapsibleGradientHeader 컴포넌트
 *
 * 스크롤에 따라 축소되는 그라디언트 헤더
 * 스크롤 시 자연스러운 높이/폰트 애니메이션
 */
import React from 'react';
import { StyleSheet, Platform, Animated, ViewStyle } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients } from '@/theme/tokens';

export interface CollapsibleGradientHeaderProps {
  /** 스크롤 Y 값 (Animated.Value) */
  scrollY: Animated.Value;
  /** 확장 시 헤더 높이 (기본값: 180) */
  expandedHeight?: number;
  /** 축소 시 헤더 높이 (기본값: 100) */
  collapsedHeight?: number;
  /** 상단 타이틀 (작은 글씨) */
  subtitle?: string;
  /** 메인 타이틀 */
  title: string;
  /** 우측 액션 컴포넌트 */
  rightAction?: React.ReactNode;
  /** 하단 컨텐츠 (검색창 등) - 축소 시 숨김 */
  bottomContent?: React.ReactNode;
  /** 그라디언트 색상 (기본: primary) */
  variant?: 'primary' | 'accent';
  /** 하단 곡선 표시 여부 */
  curved?: boolean;
  /** 애니메이션 속도 배수 (기본값: 1.5, 높을수록 느림) */
  animationSpeed?: number;
}

// Animated LinearGradient
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * 스크롤 반응형 Collapsible 헤더
 *
 * @example
 * ```tsx
 * const scrollY = useRef(new Animated.Value(0)).current;
 *
 * <CollapsibleGradientHeader
 *   scrollY={scrollY}
 *   title="설비 정보"
 *   bottomContent={<SearchInput />}
 * />
 * <Animated.FlatList
 *   onScroll={Animated.event(
 *     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
 *     { useNativeDriver: false }
 *   )}
 * />
 * ```
 */
export function CollapsibleGradientHeader({
  scrollY,
  expandedHeight = 180,
  collapsedHeight = 100,
  subtitle,
  title,
  rightAction,
  bottomContent,
  variant = 'primary',
  curved = true,
  animationSpeed = 1.5,
}: CollapsibleGradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const gradientColors = variant === 'primary' ? gradients.primary : gradients.accent;

  // 스크롤 범위 (animationSpeed 배수 적용 - 느린 애니메이션)
  const baseRange = expandedHeight - collapsedHeight;
  const scrollRange = baseRange * animationSpeed;

  // 헤더 높이 애니메이션
  const headerHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [expandedHeight + insets.top, collapsedHeight + insets.top],
    extrapolate: 'clamp',
  });

  // 타이틀 크기 애니메이션
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [28, 20],
    extrapolate: 'clamp',
  });

  // 서브타이틀 opacity 애니메이션
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 하단 컨텐츠 opacity 애니메이션
  const bottomContentOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.7],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 하단 컨텐츠 높이 애니메이션
  const bottomContentHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [60, 0],
    extrapolate: 'clamp',
  });

  // 곡선 radius 애니메이션
  const borderRadius = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [32, 20],
    extrapolate: 'clamp',
  });

  // 장식 원 opacity
  const decorOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container]}>
      <AnimatedLinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingTop: insets.top,
            minHeight: headerHeight,
            borderBottomLeftRadius: curved ? borderRadius : 0,
            borderBottomRightRadius: curved ? borderRadius : 0,
          } as Animated.AnimatedProps<ViewStyle>,
        ]}
      >
        {/* 메인 헤더 콘텐츠 */}
        <XStack
          paddingHorizontal="$5"
          paddingTop="$3"
          paddingBottom="$2"
          justifyContent="space-between"
          alignItems="center"
        >
          <YStack flex={1} gap="$1">
            {subtitle && (
              <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
                {subtitle}
              </Animated.Text>
            )}
            <Animated.Text style={[styles.title, { fontSize: titleFontSize }]}>
              {title}
            </Animated.Text>
          </YStack>

          {rightAction && <YStack alignItems="flex-end">{rightAction}</YStack>}
        </XStack>

        {/* 하단 콘텐츠 (검색창 등) - 스크롤 시 숨김 */}
        {bottomContent && (
          <Animated.View
            style={[
              styles.bottomContent,
              {
                opacity: bottomContentOpacity,
                maxHeight: bottomContentHeight,
              },
            ]}
          >
            {bottomContent}
          </Animated.View>
        )}
      </AnimatedLinearGradient>

      {/* 장식용 원형 오버레이 */}
      <Animated.View
        style={[
          styles.decorCircle1,
          {
            top: insets.top + 10,
            opacity: decorOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle2,
          {
            bottom: curved ? 30 : 10,
            opacity: decorOpacity,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  gradient: {
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
  decorCircle2: {
    position: 'absolute',
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    pointerEvents: 'none',
  },
});

export default CollapsibleGradientHeader;
