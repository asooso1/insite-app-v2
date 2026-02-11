/**
 * GradientHeader 컴포넌트
 *
 * 2026 Modern UI - 그라디언트 헤더
 * 브랜드 그라디언트 배경과 bold 타이포그래피
 */
import React from 'react';
import { YStack, Text } from 'tamagui';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GradientHeaderProps {
  /** 제목 */
  title: string;
  /** 부제목 */
  subtitle?: string;
  /** 추가 정보 (예: "오늘 3건의 순찰이 있습니다") */
  info?: string;
  /** 배경 그라디언트 색상 */
  colors?: readonly [string, string];
  /** 오른쪽 액션 컴포넌트 */
  rightAction?: React.ReactNode;
  /** 패딩 상단에 safe area 포함 여부 */
  includeSafeArea?: boolean;
}

/**
 * 그라디언트 헤더 컴포넌트
 */
export function GradientHeader({
  title,
  subtitle,
  info,
  colors = ['#0066CC', '#00A3FF'],
  rightAction,
  includeSafeArea = false,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, includeSafeArea && { paddingTop: insets.top + 16 }]}
      >
        {/* 배경 패턴 */}
        <View style={styles.patternOverlay}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        <YStack paddingHorizontal="$5" paddingVertical="$4" gap="$1" zIndex={1}>
          <YStack gap="$1" flex={1}>
            <Text fontSize={28} fontWeight="800" color="white" letterSpacing={-0.5}>
              {title}
            </Text>
            {subtitle && (
              <Text fontSize={15} color="rgba(255, 255, 255, 0.85)" fontWeight="500">
                {subtitle}
              </Text>
            )}
            {info && (
              <Text fontSize={14} color="rgba(255, 255, 255, 0.7)" marginTop="$1">
                {info}
              </Text>
            )}
          </YStack>

          {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </YStack>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    position: 'relative',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -80,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -30,
    left: -20,
  },
  rightAction: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
});

export default GradientHeader;
