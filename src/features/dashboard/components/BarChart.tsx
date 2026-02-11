/**
 * BarChart 컴포넌트
 *
 * 2026 Modern UI - 수평 막대 차트
 * 그라디언트 채우기, 라벨, 퍼센트
 */
import React, { useEffect } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface BarItem {
  /** 라벨 */
  label: string;
  /** 값 */
  value: number;
  /** 최대값 (퍼센트 계산용) */
  max: number;
  /** 그라디언트 색상 (선택) */
  gradient?: readonly [string, string];
}

interface BarChartProps {
  /** 차트 제목 */
  title: string;
  /** 막대 데이터 */
  items: BarItem[];
  /** 기본 그라디언트 색상 */
  defaultGradient?: readonly [string, string];
  /** 막대 높이 */
  barHeight?: number;
  /** 부제목 */
  subtitle?: string;
}

/**
 * 수평 막대 차트
 */
export function BarChart({
  title,
  items,
  defaultGradient = ['#0066CC', '#00A3FF'],
  barHeight = 24,
  subtitle,
}: BarChartProps) {
  return (
    <YStack
      backgroundColor="$white"
      borderRadius="$5"
      padding="$4"
      borderWidth={1}
      borderColor="rgba(226, 232, 240, 0.8)"
      style={styles.container}
    >
      {/* 헤더 */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
        <YStack>
          <Text fontSize={18} fontWeight="700" color="$gray900" letterSpacing={-0.3}>
            {title}
          </Text>
          {subtitle && (
            <Text fontSize={13} color="$gray500" marginTop="$1">
              {subtitle}
            </Text>
          )}
        </YStack>
      </XStack>

      {/* 막대들 */}
      <YStack gap="$3">
        {items.map((item, idx) => (
          <BarItem
            key={item.label}
            item={item}
            defaultGradient={defaultGradient}
            barHeight={barHeight}
            delay={idx * 100}
          />
        ))}
      </YStack>
    </YStack>
  );
}

interface BarItemProps {
  item: BarItem;
  defaultGradient: readonly [string, string];
  barHeight: number;
  delay: number;
}

function BarItem({
  item,
  defaultGradient,
  barHeight,
  delay,
}: BarItemProps) {
  const percentage = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
  const widthAnim = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      widthAnim.value = withTiming(percentage, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 400 });
    }, delay);

    return () => clearTimeout(timeout);
  }, [percentage, delay, widthAnim, opacity]);

  const barAnimStyle = useAnimatedStyle(() => {
    return {
      width: `${widthAnim.value}%`,
    };
  });

  const containerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const gradient = item.gradient || defaultGradient;
  const isComplete = percentage === 100;

  return (
    <Animated.View style={containerAnimStyle}>
      <XStack alignItems="center" gap="$3">
        {/* 라벨 */}
        <Text
          fontSize={14}
          fontWeight="500"
          color="$gray700"
          width={50}
          numberOfLines={1}
        >
          {item.label}
        </Text>

        {/* 막대 */}
        <YStack flex={1}>
          <YStack
            height={barHeight}
            backgroundColor="$gray100"
            borderRadius="$2"
            overflow="hidden"
          >
            <Animated.View style={[styles.barFill, barAnimStyle]}>
              <LinearGradient
                colors={isComplete ? ['#00C853', '#69F0AE'] : gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {/* 막대 내부 텍스트 (공간이 충분할 때만) */}
              {percentage >= 25 && (
                <Text
                  fontSize={11}
                  fontWeight="700"
                  color="white"
                  position="absolute"
                  right="$2"
                  top={0}
                  bottom={0}
                  textAlignVertical="center"
                  style={styles.barText}
                >
                  {percentage}%
                </Text>
              )}
            </Animated.View>
          </YStack>
        </YStack>

        {/* 퍼센트 (막대 외부) */}
        {percentage < 25 && (
          <Text
            fontSize={14}
            fontWeight="700"
            color={isComplete ? '$success' : '$gray600'}
            width={45}
            textAlign="right"
          >
            {percentage}%
          </Text>
        )}

        {/* 완료 체크 아이콘 */}
        {isComplete && (
          <YStack
            width={24}
            height={24}
            borderRadius="$full"
            backgroundColor="$success"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={12} color="white" fontWeight="700">
              ✓
            </Text>
          </YStack>
        )}
      </XStack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    minWidth: 4,
  },
  barText: {
    lineHeight: 24,
  },
});

export default BarChart;
