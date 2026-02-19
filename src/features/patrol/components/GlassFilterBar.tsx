/**
 * Glass Filter Bar 컴포넌트
 *
 * 2026 Modern UI - Glassmorphism 필터 바
 * 반투명 배경과 부드러운 전환 효과
 */
import React from 'react';
import { XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { PatrolFilterOption } from '../types/patrol.types';

interface FilterOption {
  value: PatrolFilterOption;
  label: string;
  count?: number;
}

interface GlassFilterBarProps {
  options: FilterOption[];
  selectedFilter: PatrolFilterOption;
  onFilterChange: (filter: PatrolFilterOption) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Glassmorphism 스타일 필터 바
 */
export function GlassFilterBar({ options, selectedFilter, onFilterChange }: GlassFilterBarProps) {
  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      gap="$2"
      backgroundColor="rgba(248, 250, 252, 0.8)"
      borderBottomWidth={1}
      borderBottomColor="rgba(226, 232, 240, 0.6)"
    >
      {options.map((option) => (
        <FilterPill
          key={option.value}
          option={option}
          isSelected={selectedFilter === option.value}
          onPress={() => onFilterChange(option.value)}
        />
      ))}
    </XStack>
  );
}

interface FilterPillProps {
  option: FilterOption;
  isSelected: boolean;
  onPress: () => void;
}

function FilterPill({ option, isSelected, onPress }: FilterPillProps) {
  const scale = useSharedValue(1);
  const selected = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    selected.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected, selected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ flex: 1, borderRadius: 999, overflow: 'hidden' }, animatedStyle]}
    >
      {isSelected ? (
        <LinearGradient
          colors={['#0066CC', '#00A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
        >
          <XStack paddingVertical="$2" paddingHorizontal="$4" gap="$1" alignItems="center">
            <Text fontSize={14} fontWeight="600" color="white">
              {option.label}
            </Text>
            {option.count !== undefined && (
              <Text
                fontSize={12}
                fontWeight="700"
                color="rgba(255, 255, 255, 0.9)"
                backgroundColor="rgba(255, 255, 255, 0.2)"
                paddingHorizontal="$2"
                paddingVertical={2}
                borderRadius="$full"
              >
                {option.count}
              </Text>
            )}
          </XStack>
        </LinearGradient>
      ) : (
        <XStack
          paddingVertical="$2"
          paddingHorizontal="$4"
          gap="$1"
          alignItems="center"
          backgroundColor="rgba(255, 255, 255, 0.7)"
          borderWidth={1}
          borderColor="rgba(226, 232, 240, 0.8)"
          borderRadius="$full"
        >
          <Text fontSize={14} fontWeight="500" color="$gray600">
            {option.label}
          </Text>
          {option.count !== undefined && (
            <Text
              fontSize={12}
              fontWeight="600"
              color="$gray500"
              backgroundColor="$gray100"
              paddingHorizontal="$2"
              paddingVertical={2}
              borderRadius="$full"
            >
              {option.count}
            </Text>
          )}
        </XStack>
      )}
    </AnimatedPressable>
  );
}

export default GlassFilterBar;
