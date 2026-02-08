/**
 * GradientHeader 컴포넌트
 *
 * 2026 Modern UI - 그라디언트 배경의 곡선형 헤더
 * 홈화면, 작업지시 등 주요 화면 상단에 사용
 */
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients } from '@/theme/tokens';

export interface GradientHeaderProps {
  /** 헤더 높이 (기본값: 200) */
  height?: number;
  /** 상단 타이틀 (작은 글씨) */
  subtitle?: string;
  /** 메인 타이틀 */
  title: string;
  /** 우측 액션 컴포넌트 */
  rightAction?: React.ReactNode;
  /** 하단 컨텐츠 (검색창 등) */
  bottomContent?: React.ReactNode;
  /** 그라디언트 색상 (기본: primary) */
  variant?: 'primary' | 'accent';
  /** 하단 곡선 표시 여부 */
  curved?: boolean;
}

/**
 * 그라디언트 곡선형 헤더
 *
 * @example
 * ```tsx
 * <GradientHeader
 *   subtitle="안녕하세요,"
 *   title="홍길동님"
 *   rightAction={<Badge>현장명</Badge>}
 * />
 * ```
 */
export function GradientHeader({
  height = 200,
  subtitle,
  title,
  rightAction,
  bottomContent,
  variant = 'primary',
  curved = true,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const gradientColors = variant === 'primary' ? gradients.primary : gradients.accent;

  return (
    <YStack position="relative" marginBottom={curved ? -24 : 0}>
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingTop: insets.top,
            minHeight: height + insets.top,
            borderBottomLeftRadius: curved ? 32 : 0,
            borderBottomRightRadius: curved ? 32 : 0,
          },
        ]}
      >
        {/* 메인 헤더 콘텐츠 */}
        <XStack
          paddingHorizontal="$5"
          paddingTop="$4"
          paddingBottom="$3"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <YStack flex={1} gap="$1">
            {subtitle && (
              <Text
                fontSize={14}
                color="rgba(255, 255, 255, 0.8)"
                fontWeight="400"
              >
                {subtitle}
              </Text>
            )}
            <Text
              fontSize={28}
              fontWeight="800"
              color="$white"
              letterSpacing={-0.5}
            >
              {title}
            </Text>
          </YStack>

          {rightAction && (
            <YStack alignItems="flex-end">
              {rightAction}
            </YStack>
          )}
        </XStack>

        {/* 하단 콘텐츠 (검색창 등) */}
        {bottomContent && (
          <YStack paddingHorizontal="$5" paddingBottom="$4">
            {bottomContent}
          </YStack>
        )}
      </LinearGradient>

      {/* 장식용 원형 오버레이 */}
      <YStack
        position="absolute"
        top={insets.top + 20}
        right={-40}
        width={120}
        height={120}
        borderRadius={60}
        backgroundColor="rgba(255, 255, 255, 0.1)"
        pointerEvents="none"
      />
      <YStack
        position="absolute"
        bottom={curved ? 40 : 20}
        left={-20}
        width={80}
        height={80}
        borderRadius={40}
        backgroundColor="rgba(255, 255, 255, 0.08)"
        pointerEvents="none"
      />
    </YStack>
  );
}

const styles = StyleSheet.create({
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
});

export default GradientHeader;
