/**
 * QuickStatCard 컴포넌트
 *
 * 2026 Modern UI - 빠른 통계 표시용 카드
 * 아이콘 + 숫자 + 라벨 형태의 컴팩트한 카드
 */
import React from 'react';
import { StyleSheet, Platform, ViewStyle } from 'react-native';
import { YStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/tokens';

interface QuickStatCardProps {
  /** 아이콘 (이모지 또는 컴포넌트) */
  icon: string | React.ReactNode;
  /** 숫자 값 */
  value: number | string;
  /** 라벨 */
  label: string;
  /** 그라디언트 타입 */
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'neutral';
  /** 프레스 이벤트 */
  onPress?: () => void;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 그라디언트 아이콘을 가진 통계 카드
 *
 * @example
 * ```tsx
 * <QuickStatCard
 *   icon="📋"
 *   value={5}
 *   label="오늘의 작업"
 *   variant="primary"
 *   onPress={() => navigation.push('/work')}
 * />
 * ```
 */
export function QuickStatCard({
  icon,
  value,
  label,
  variant = 'primary',
  onPress,
  size = 'md',
}: QuickStatCardProps) {
  const getGradientColors = (): readonly [string, string] => {
    switch (variant) {
      case 'accent':
        return gradients.accent;
      case 'success':
        return gradients.success;
      case 'warning':
        return gradients.warning;
      case 'neutral':
        return ['#64748B', '#94A3B8'];
      case 'primary':
      default:
        return gradients.primary;
    }
  };

  const getSizing = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 36,
          valueSize: 20,
          labelSize: 11,
          padding: 12,
          iconTextSize: 18,
        };
      case 'lg':
        return {
          iconSize: 52,
          valueSize: 32,
          labelSize: 14,
          padding: 20,
          iconTextSize: 26,
        };
      case 'md':
      default:
        return {
          iconSize: 44,
          valueSize: 26,
          labelSize: 12,
          padding: 16,
          iconTextSize: 22,
        };
    }
  };

  const sizing = getSizing();

  return (
    <YStack
      flex={1}
      backgroundColor="$surface"
      borderRadius={16}
      padding={sizing.padding}
      alignItems="center"
      gap="$2"
      pressStyle={onPress ? { opacity: 0.9, scale: 0.97 } : undefined}
      onPress={onPress}
      style={Platform.select({
        ios: {
          shadowColor: '#0066CC',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }) as ViewStyle}
    >
      {/* 그라디언트 아이콘 배경 */}
      <YStack
        width={sizing.iconSize}
        height={sizing.iconSize}
        borderRadius={sizing.iconSize / 2}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
      >
        <LinearGradient
          colors={[...getGradientColors()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          {typeof icon === 'string' ? (
            <Text fontSize={sizing.iconTextSize}>{icon}</Text>
          ) : (
            icon
          )}
        </LinearGradient>
      </YStack>

      {/* 값 */}
      <Text
        fontSize={sizing.valueSize}
        fontWeight="800"
        color="$gray900"
        letterSpacing={-0.5}
      >
        {value}
      </Text>

      {/* 라벨 */}
      <Text
        fontSize={sizing.labelSize}
        fontWeight="500"
        color="$gray500"
        textAlign="center"
      >
        {label}
      </Text>
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuickStatCard;
