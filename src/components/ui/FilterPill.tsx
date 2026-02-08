/**
 * FilterPill 컴포넌트
 *
 * 2026 Modern UI - 필터 선택용 필 버튼
 * 선택 시 그라디언트 배경, 비선택 시 글래스 효과
 */
import React from 'react';
import { StyleSheet, Platform, ViewStyle } from 'react-native';
import { XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/tokens';

interface FilterPillProps {
  /** 라벨 */
  label: string;
  /** 선택 여부 */
  selected?: boolean;
  /** 선택 이벤트 */
  onPress?: () => void;
  /** 비활성화 */
  disabled?: boolean;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 필터 필 버튼
 *
 * @example
 * ```tsx
 * <FilterPill
 *   label="진행중"
 *   selected={filter === 'PROCESSING'}
 *   onPress={() => setFilter('PROCESSING')}
 * />
 * ```
 */
export function FilterPill({
  label,
  selected = false,
  onPress,
  disabled = false,
  size = 'md',
}: FilterPillProps) {
  const getSizing = () => {
    switch (size) {
      case 'sm':
        return { paddingH: 12, paddingV: 6, fontSize: 12 };
      case 'lg':
        return { paddingH: 20, paddingV: 12, fontSize: 15 };
      case 'md':
      default:
        return { paddingH: 16, paddingV: 8, fontSize: 13 };
    }
  };

  const sizing = getSizing();

  if (selected) {
    return (
      <XStack
        borderRadius={20}
        overflow="hidden"
        pressStyle={{ opacity: 0.9, scale: 0.97 }}
        onPress={disabled ? undefined : onPress}
        opacity={disabled ? 0.5 : 1}
        style={Platform.select({
          ios: {
            shadowColor: '#0066CC',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
          },
          android: {
            elevation: 3,
          },
        }) as ViewStyle}
      >
        <LinearGradient
          colors={[...gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.pillGradient,
            {
              paddingHorizontal: sizing.paddingH,
              paddingVertical: sizing.paddingV,
            },
          ]}
        >
          <Text
            fontSize={sizing.fontSize}
            fontWeight="600"
            color="$white"
          >
            {label}
          </Text>
        </LinearGradient>
      </XStack>
    );
  }

  return (
    <XStack
      backgroundColor="rgba(255, 255, 255, 0.8)"
      borderRadius={20}
      borderWidth={1}
      borderColor="$gray200"
      paddingHorizontal={sizing.paddingH}
      paddingVertical={sizing.paddingV}
      pressStyle={{ opacity: 0.8, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
      onPress={disabled ? undefined : onPress}
      opacity={disabled ? 0.5 : 1}
    >
      <Text
        fontSize={sizing.fontSize}
        fontWeight="500"
        color="$gray600"
      >
        {label}
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  pillGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FilterPill;
