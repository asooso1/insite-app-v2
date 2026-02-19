/**
 * QuickStatCard 컴포넌트
 *
 * 2026 Modern UI - 빠른 통계 표시용 카드
 * 아이콘 + 숫자 + 라벨 형태의 컴팩트한 카드
 * Lucide Icons 지원
 *
 * 시니어 모드 지원:
 * - 더 큰 아이콘과 텍스트
 * - 고대비 색상
 * - 테두리로 클릭 가능 표시
 */
import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { YStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/tokens';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { AppIcon, type IconName } from '@/components/icons';

interface QuickStatCardProps {
  /** 아이콘 이름 (IconName) 또는 React 노드 */
  icon: IconName | React.ReactNode;
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
  const seniorStyles = useSeniorStyles();
  const { isSeniorMode } = seniorStyles;

  // 시니어 모드용 고대비 그라디언트 색상
  const getSeniorGradientColors = (): readonly [string, string] => {
    switch (variant) {
      case 'accent':
        return ['#CC5500', '#FF6B00']; // 더 진한 오렌지
      case 'success':
        return ['#004D26', '#006633']; // 더 진한 녹색
      case 'warning':
        return ['#996600', '#CC6600']; // 더 진한 주황
      case 'neutral':
        return ['#333333', '#555555']; // 더 진한 회색
      case 'primary':
      default:
        return ['#003366', '#004D99']; // 더 진한 파란색
    }
  };

  const getGradientColors = (): readonly [string, string] => {
    if (isSeniorMode) {
      return getSeniorGradientColors();
    }
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
    // 시니어 모드: 확대된 사이즈
    if (isSeniorMode) {
      switch (size) {
        case 'sm':
          return {
            iconSize: 48,
            valueSize: 26,
            labelSize: 16,
            padding: 16,
            iconTextSize: 24,
          };
        case 'lg':
          return {
            iconSize: 64,
            valueSize: 36,
            labelSize: 20,
            padding: 24,
            iconTextSize: 32,
          };
        case 'md':
        default:
          return {
            iconSize: 56,
            valueSize: 30,
            labelSize: 18,
            padding: 20,
            iconTextSize: 28,
          };
      }
    }

    // 일반 모드
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

  // 시니어 모드 스타일
  const seniorCardStyle: ViewStyle = isSeniorMode
    ? {
        borderWidth: 2,
        borderColor: seniorStyles.colors.border,
      }
    : {};

  return (
    <YStack
      flex={1}
      backgroundColor="$surface"
      borderRadius={16}
      padding={sizing.padding}
      alignItems="center"
      gap="$2"
      // 시니어 모드: 더 강한 눌림 효과
      pressStyle={
        onPress
          ? { opacity: isSeniorMode ? 0.85 : 0.9, scale: isSeniorMode ? 0.95 : 0.97 }
          : undefined
      }
      onPress={onPress}
      style={
        {
          ...Platform.select({
            ios: {
              shadowColor: isSeniorMode ? '#000000' : '#0066CC',
              shadowOffset: { width: 0, height: isSeniorMode ? 3 : 4 },
              shadowOpacity: isSeniorMode ? 0.2 : 0.1,
              shadowRadius: isSeniorMode ? 6 : 12,
            },
            android: {
              elevation: isSeniorMode ? 5 : 4,
            },
          }),
          ...seniorCardStyle,
        } as ViewStyle
      }
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
          style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          {typeof icon === 'string' ? (
            <AppIcon name={icon as IconName} size={sizing.iconTextSize} color="$white" />
          ) : (
            icon
          )}
        </LinearGradient>
      </YStack>

      {/* 값 */}
      <Text
        fontSize={sizing.valueSize}
        fontWeight="800"
        color={isSeniorMode ? (seniorStyles.colors.text as any) : '$gray900'}
        letterSpacing={-0.5}
      >
        {value}
      </Text>

      {/* 라벨 */}
      <Text
        fontSize={sizing.labelSize}
        fontWeight={isSeniorMode ? '600' : '500'}
        color={isSeniorMode ? (seniorStyles.colors.textSecondary as any) : '$gray500'}
        textAlign="center"
      >
        {label}
      </Text>
    </YStack>
  );
}

export default QuickStatCard;
