/**
 * DonutChart 컴포넌트
 *
 * 2026 Modern UI - SVG 도넛 차트
 * 그라디언트 세그먼트, 범례, 애니메이션
 */
import React, { useEffect, useMemo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ChartSegment {
  /** 라벨 */
  label: string;
  /** 값 */
  value: number;
  /** 그라디언트 색상 */
  gradient: readonly [string, string];
}

interface DonutChartProps {
  /** 차트 제목 */
  title: string;
  /** 세그먼트 데이터 */
  segments: ChartSegment[];
  /** 차트 크기 */
  size?: number;
  /** 스트로크 두께 */
  strokeWidth?: number;
  /** 총합 레이블 */
  totalLabel?: string;
}

/**
 * 도넛 차트 컴포넌트
 */
export function DonutChart({
  title,
  segments,
  size = 140,
  strokeWidth = 20,
  totalLabel = '총',
}: DonutChartProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 각 세그먼트의 시작 위치와 길이 계산
  const segmentData = useMemo(() => {
    let accumulated = 0;
    return segments.map((segment) => {
      const percentage = total > 0 ? segment.value / total : 0;
      const length = circumference * percentage;
      const offset = circumference * (1 - accumulated);
      accumulated += percentage;
      return {
        ...segment,
        percentage,
        length,
        offset,
      };
    });
  }, [segments, total, circumference]);

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
        <Text fontSize={18} fontWeight="700" color="$gray900" letterSpacing={-0.3}>
          {title}
        </Text>
        <Text fontSize={14} color="$gray500">
          {totalLabel} {total}건
        </Text>
      </XStack>

      {/* 차트 및 범례 */}
      <XStack gap="$5" alignItems="center">
        {/* 도넛 차트 */}
        <YStack position="relative" alignItems="center" justifyContent="center">
          <Svg width={size} height={size}>
            <Defs>
              {segmentData.map((seg, idx) => (
                <SvgGradient
                  key={`gradient-${idx}`}
                  id={`segment-gradient-${idx}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor={seg.gradient[0]} />
                  <Stop offset="100%" stopColor={seg.gradient[1]} />
                </SvgGradient>
              ))}
            </Defs>

            <G transform={`rotate(-90 ${center} ${center})`}>
              {/* 배경 원 */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* 세그먼트들 */}
              {segmentData.map((seg, idx) => (
                <AnimatedSegment
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  strokeWidth={strokeWidth}
                  gradientId={`segment-gradient-${idx}`}
                  strokeDasharray={circumference}
                  strokeDashoffset={seg.offset}
                  length={seg.length}
                  delay={idx * 150}
                />
              ))}
            </G>
          </Svg>

          {/* 중앙 텍스트 */}
          <YStack
            position="absolute"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={32} fontWeight="800" color="$gray900" letterSpacing={-1}>
              {total > 0 && segments[0] ? Math.round((segments[0].value / total) * 100) : 0}%
            </Text>
            <Text fontSize={12} color="$gray500">
              {segments[0]?.label ?? ''}
            </Text>
          </YStack>
        </YStack>

        {/* 범례 */}
        <YStack gap="$3" flex={1}>
          {segmentData.map((seg, idx) => (
            <LegendItem
              key={idx}
              label={seg.label}
              value={seg.value}
              percentage={Math.round(seg.percentage * 100)}
              gradient={seg.gradient}
            />
          ))}
        </YStack>
      </XStack>
    </YStack>
  );
}

interface AnimatedSegmentProps {
  cx: number;
  cy: number;
  r: number;
  strokeWidth: number;
  gradientId: string;
  strokeDasharray: number;
  strokeDashoffset: number;
  length: number;
  delay: number;
}

function AnimatedSegment({
  cx,
  cy,
  r,
  strokeWidth,
  gradientId,
  strokeDasharray,
  strokeDashoffset,
  length,
  delay,
}: AnimatedSegmentProps) {
  const animatedLength = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      animatedLength.value = withTiming(length, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [length, delay, animatedLength]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDasharray: [animatedLength.value, strokeDasharray - animatedLength.value],
    };
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      stroke={`url(#${gradientId})`}
      strokeWidth={strokeWidth}
      fill="transparent"
      strokeDashoffset={strokeDashoffset}
      animatedProps={animatedProps}
      strokeLinecap="round"
    />
  );
}

interface LegendItemProps {
  label: string;
  value: number;
  percentage: number;
  gradient: readonly [string, string];
}

function LegendItem({ label, value, percentage, gradient }: LegendItemProps) {
  return (
    <XStack alignItems="center" gap="$2">
      <View style={styles.legendDot}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <YStack flex={1}>
        <Text fontSize={13} color="$gray600">
          {label}
        </Text>
      </YStack>
      <Text fontSize={15} fontWeight="700" color="$gray900">
        {value}
      </Text>
      <Text fontSize={12} color="$gray400" width={36} textAlign="right">
        {percentage}%
      </Text>
    </XStack>
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
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

export default DonutChart;
