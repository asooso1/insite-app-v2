/**
 * ProgressBar 컴포넌트
 *
 * 2026 Modern UI - 그라디언트 프로그레스 바
 * 그라디언트 채우기
 */
import React from 'react';
import { StyleSheet, ViewStyle, Platform, View } from 'react-native';
import { YStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/tokens';

interface ProgressBarProps {
  /** 진행률 (0-100) */
  progress: number;
  /** 높이 (기본: 8) */
  height?: number;
  /** 그라디언트 색상 */
  variant?: 'primary' | 'success' | 'warning' | 'accent';
  /** 애니메이션 사용 */
  animated?: boolean;
  /** 글로우 효과 */
  glow?: boolean;
  /** 라운드 형태 */
  rounded?: boolean;
}

/**
 * 그라디언트 프로그레스 바
 *
 * @example
 * ```tsx
 * <ProgressBar progress={75} variant="success" animated />
 * ```
 */
export function ProgressBar({
  progress,
  height = 8,
  variant = 'primary',
  glow = false,
  rounded = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const getGradientColors = (): readonly [string, string] => {
    switch (variant) {
      case 'success':
        return gradients.success;
      case 'warning':
        return gradients.warning;
      case 'accent':
        return gradients.accent;
      case 'primary':
      default:
        return gradients.primary;
    }
  };

  const getGlowStyle = (): ViewStyle => {
    if (!glow) return {};
    return Platform.select({
      ios: {
        shadowColor: getGradientColors()[0],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }) as ViewStyle;
  };

  return (
    <YStack
      height={height}
      backgroundColor="$gray200"
      borderRadius={rounded ? height / 2 : 2}
      overflow="hidden"
    >
      <View
        style={[
          styles.progressFill,
          {
            height,
            borderRadius: rounded ? height / 2 : 2,
            width: `${clampedProgress}%`,
          },
          getGlowStyle(),
        ]}
      >
        <LinearGradient
          colors={[...getGradientColors()]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});

export default ProgressBar;
