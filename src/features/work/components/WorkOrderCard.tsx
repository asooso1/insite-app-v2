/**
 * 작업지시 카드 컴포넌트
 *
 * 2026 Modern UI - Floating Card 스타일
 * 그라디언트 상태 인디케이터, 볼드 타이포그래피, 부드러운 그림자
 */
import React from 'react';
import { StyleSheet, Platform, ViewStyle, Pressable } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { WorkOrderDTO } from '@/api/generated/models';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface WorkOrderCardProps {
  workOrder: WorkOrderDTO;
  onPress?: (workOrder: WorkOrderDTO) => void;
  /** 프로그레스 표시 (0-100) */
  progress?: number;
  /** 컴팩트 모드 */
  compact?: boolean;
}

/**
 * 상태별 그라디언트 색상
 */
const STATUS_GRADIENTS = {
  WRITE: ['#64748B', '#94A3B8'] as [string, string], // 작성 - 그레이
  ISSUE: ['#00C853', '#69F0AE'] as [string, string], // 발행 - 그린
  PROCESSING: ['#FF6B00', '#FFB800'] as [string, string], // 처리중 - 오렌지 (액센트)
  REQ_COMPLETE: ['#0066CC', '#00A3FF'] as [string, string], // 완료요청 - 블루
  COMPLETE: ['#00A043', '#00C853'] as [string, string], // 완료 - 다크그린
  CANCEL: ['#DC2626', '#EF4444'] as [string, string], // 취소 - 레드
} as const;

type StatusGradientKey = keyof typeof STATUS_GRADIENTS;

function getStatusGradient(state: string | undefined): [string, string] {
  if (state && state in STATUS_GRADIENTS) {
    return STATUS_GRADIENTS[state as StatusGradientKey];
  }
  return STATUS_GRADIENTS.WRITE;
}

/**
 * 상태별 배경색 (연한 버전)
 */
const STATUS_BG_COLORS: Record<string, string> = {
  WRITE: 'rgba(100, 116, 139, 0.08)',
  ISSUE: 'rgba(0, 200, 83, 0.08)',
  PROCESSING: 'rgba(255, 107, 0, 0.08)',
  REQ_COMPLETE: 'rgba(0, 102, 204, 0.08)',
  COMPLETE: 'rgba(0, 160, 67, 0.08)',
  CANCEL: 'rgba(220, 38, 38, 0.08)',
};

/**
 * 상태 한글명 매핑
 */
const STATUS_NAMES: Record<string, string> = {
  WRITE: '작성',
  ISSUE: '발행',
  PROCESSING: '처리중',
  REQ_COMPLETE: '완료요청',
  COMPLETE: '완료',
  CANCEL: '취소',
};

/**
 * 2026 Modern 작업지시 카드
 */
export function WorkOrderCard({
  workOrder,
  onPress,
  progress,
  compact = false,
}: WorkOrderCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1);
  };

  const handlePress = () => {
    onPress?.(workOrder);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const statusGradient = getStatusGradient(workOrder.state);
  const statusBg = STATUS_BG_COLORS[workOrder.state || 'WRITE'] || STATUS_BG_COLORS.WRITE;
  const statusName = workOrder.stateName || STATUS_NAMES[workOrder.state || 'WRITE'];

  // 완료 상태면 100% 진행률
  const displayProgress = workOrder.state === 'COMPLETE' ? 100 : progress;

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <YStack
          marginHorizontal="$4"
          marginVertical="$2"
          backgroundColor="$surface"
          borderRadius={20}
          overflow="hidden"
          style={
            Platform.select({
              ios: {
                shadowColor: '#0066CC',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
              },
              android: {
                elevation: 6,
              },
            }) as ViewStyle
          }
        >
          {/* 그라디언트 상태 인디케이터 (좌측 보더) */}
          <YStack position="absolute" left={0} top={0} bottom={0} width={4} overflow="hidden">
            <LinearGradient
              colors={statusGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </YStack>

          <YStack padding="$4" paddingLeft="$5">
            {/* 헤더: 상태 배지 + 날짜 */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              {/* 상태 배지 (그라디언트) */}
              <XStack borderRadius={8} overflow="hidden">
                <LinearGradient
                  colors={statusGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusBadge}
                >
                  <Text fontSize={12} fontWeight="700" color="$white">
                    {statusName}
                  </Text>
                </LinearGradient>
              </XStack>

              {/* 날짜 */}
              <Text fontSize={12} color="$gray400" fontWeight="500">
                {workOrder.planStartDate}
              </Text>
            </XStack>

            {/* 제목 */}
            <Text
              fontSize={17}
              fontWeight="700"
              color="$gray900"
              numberOfLines={2}
              marginBottom="$2"
              letterSpacing={-0.3}
            >
              {workOrder.name}
            </Text>

            {/* 위치 + 분류 */}
            <XStack gap="$2" alignItems="center" marginBottom="$3">
              <Text fontSize={13} color="$gray500">
                {workOrder.buildingName}
              </Text>
              <Text fontSize={13} color="$gray300">
                |
              </Text>
              <Text fontSize={13} color="$gray500">
                {workOrder.firstClassName}
              </Text>
            </XStack>

            {!compact && (
              <>
                {/* 구분선 */}
                <YStack height={1} backgroundColor="$gray100" marginBottom="$3" />

                {/* 담당자 + 항목 수 */}
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$1" alignItems="center">
                    <Text fontSize={13} color="$gray400">
                      담당:
                    </Text>
                    <Text fontSize={13} fontWeight="600" color="$gray700">
                      {workOrder.writerName}
                    </Text>
                  </XStack>

                  {workOrder.itemSize !== undefined && workOrder.itemSize > 0 && (
                    <XStack
                      backgroundColor={
                        statusBg as `rgba(${number}, ${number}, ${number}, ${number})`
                      }
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={6}
                    >
                      <Text fontSize={12} fontWeight="600" color="$primary">
                        항목 {workOrder.itemSize}개
                      </Text>
                    </XStack>
                  )}
                </XStack>

                {/* 프로그레스 바 (진행중 상태일 때) */}
                {displayProgress !== undefined && workOrder.state === 'PROCESSING' && (
                  <YStack marginTop="$3">
                    <ProgressBar progress={displayProgress} variant="accent" height={6} animated />
                    <Text fontSize={11} color="$gray400" textAlign="right" marginTop="$1">
                      {displayProgress}% 완료
                    </Text>
                  </YStack>
                )}
              </>
            )}
          </YStack>
        </YStack>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default WorkOrderCard;
