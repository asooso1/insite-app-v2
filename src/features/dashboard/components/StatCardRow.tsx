/**
 * StatCardRow 컴포넌트
 *
 * 2026 Modern UI - 통계 카드 행
 * 아이콘 + 숫자 + 라벨, 그라디언트 배경
 */
import React, { useEffect } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface StatItem {
  /** 라벨 */
  label: string;
  /** 수치 */
  value: number;
  /** 아이콘 이모지 */
  icon: string;
  /** 그라디언트 색상 */
  gradient: readonly [string, string];
  /** 텍스트 색상 */
  textColor?: string;
}

interface StatCardRowProps {
  /** 통계 아이템 목록 */
  items: StatItem[];
  /** 애니메이션 지연 시간 (ms) */
  animationDelay?: number;
}

/**
 * 통계 카드 행
 */
export function StatCardRow({
  items,
  animationDelay = 0,
}: StatCardRowProps) {
  return (
    <XStack gap="$3" paddingHorizontal="$4">
      {items.map((item, index) => (
        <StatCard
          key={item.label}
          item={item}
          delay={animationDelay + index * 100}
        />
      ))}
    </XStack>
  );
}

interface StatCardProps {
  item: StatItem;
  delay: number;
}

function StatCard({ item, delay }: StatCardProps) {
  const animatedValue = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 300 });
      animatedValue.value = withTiming(item.value, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [item.value, delay, scale, opacity, animatedValue]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, containerStyle]}>
      <YStack
        flex={1}
        backgroundColor="$white"
        borderRadius="$4"
        padding="$3"
        alignItems="center"
        justifyContent="center"
        gap="$2"
        borderWidth={1}
        borderColor="rgba(226, 232, 240, 0.8)"
      >
        {/* 아이콘 */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Text fontSize={20}>{item.icon}</Text>
          </LinearGradient>
        </View>

        {/* 숫자 */}
        <AnimatedNumber
          value={item.value}
          color={item.textColor || item.gradient[0]}
        />

        {/* 라벨 */}
        <Text fontSize={12} color="$gray500" fontWeight="500">
          {item.label}
        </Text>
      </YStack>
    </Animated.View>
  );
}

interface AnimatedNumberProps {
  value: number;
  color: string;
}

function AnimatedNumber({ value, color }: AnimatedNumberProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, animatedValue]);

  // 실제 애니메이션된 숫자를 표시하려면 react-native-reanimated의
  // useAnimatedProps와 TextInput을 사용해야 하지만,
  // 여기서는 단순히 최종 값을 표시
  return (
    <Text
      fontSize={28}
      fontWeight="800"
      style={{ color }}
      letterSpacing={-1}
    >
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StatCardRow;
