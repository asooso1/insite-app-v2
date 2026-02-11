/**
 * ProgressRing 컴포넌트
 *
 * 2026 Modern UI - 원형 프로그레스 링
 * 그라디언트 스트로크와 애니메이션 효과
 */
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { YStack, Text } from 'tamagui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  /** 진행률 (0-100) */
  progress: number;
  /** 링 크기 */
  size?: number;
  /** 스트로크 두께 */
  strokeWidth?: number;
  /** 중앙 텍스트 표시 여부 */
  showText?: boolean;
  /** 중앙 서브텍스트 */
  subtitle?: string;
  /** 애니메이션 지속 시간 (ms) */
  duration?: number;
  /** 색상 타입 */
  colorType?: 'primary' | 'success' | 'warning' | 'error';
}

/**
 * 그라디언트 원형 프로그레스 링
 */
export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  showText = true,
  subtitle,
  duration = 800,
  colorType = 'primary',
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);

  // 중심 좌표와 반지름 계산
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 색상 매핑
  const colorMap = {
    primary: { start: '#0066CC', end: '#00A3FF' },
    success: { start: '#00C853', end: '#69F0AE' },
    warning: { start: '#FF8F00', end: '#FFB300' },
    error: { start: '#DC2626', end: '#EF4444' },
  };

  const colors = colorMap[colorType];

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, duration, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      animatedProgress.value,
      [0, 100],
      [circumference, 0]
    );
    return {
      strokeDashoffset,
    };
  });

  return (
    <YStack alignItems="center" justifyContent="center" position="relative">
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={`gradient-${colorType}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.start} />
            <Stop offset="100%" stopColor={colors.end} />
          </LinearGradient>
        </Defs>

        {/* 배경 원 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.5}
        />

        {/* 프로그레스 원 */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#gradient-${colorType})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* 중앙 텍스트 */}
      {showText && (
        <YStack
          position="absolute"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={size * 0.22}
            fontWeight="700"
            color={colorType === 'primary' ? '$primary' : `$${colorType}`}
            letterSpacing={-1}
          >
            {Math.round(progress)}%
          </Text>
          {subtitle && (
            <Text fontSize={size * 0.1} color="$gray500" marginTop="$1">
              {subtitle}
            </Text>
          )}
        </YStack>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  svg: {
    transform: [{ rotateZ: '0deg' }],
  },
});

export default ProgressRing;
