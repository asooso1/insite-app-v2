/**
 * 일상업무 카드 컴포넌트
 *
 * 2026 Modern UI - Floating Card 스타일
 * 확인 상태에 따른 그라디언트 인디케이터
 */
import React from 'react';
import { StyleSheet, Platform, ViewStyle, Pressable } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { PersonalTaskDTO } from '../types';

interface PersonalTaskCardProps {
  task: PersonalTaskDTO;
  onPress?: (task: PersonalTaskDTO) => void;
  compact?: boolean;
}

/**
 * 상태별 그라디언트 색상
 */
const STATUS_GRADIENTS = {
  UNCONFIRMED: ['#FF6B00', '#FFB800'] as [string, string], // 미확인 - 오렌지
  CONFIRMED: ['#00A043', '#00C853'] as [string, string], // 확인완료 - 그린
} as const;

type StatusGradientKey = keyof typeof STATUS_GRADIENTS;

function getStatusGradient(status: string): [string, string] {
  if (status in STATUS_GRADIENTS) {
    return STATUS_GRADIENTS[status as StatusGradientKey];
  }
  return STATUS_GRADIENTS.UNCONFIRMED;
}

/**
 * 상태별 배경색 (연한 버전)
 */
const STATUS_BG_COLORS: Record<string, string> = {
  UNCONFIRMED: 'rgba(255, 107, 0, 0.08)',
  CONFIRMED: 'rgba(0, 160, 67, 0.08)',
};

/**
 * 상태 한글명 매핑
 */
const STATUS_NAMES: Record<string, string> = {
  UNCONFIRMED: '미확인',
  CONFIRMED: '확인완료',
};

/**
 * 일상업무 카드
 */
export function PersonalTaskCard({ task, onPress, compact = false }: PersonalTaskCardProps) {
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
    onPress?.(task);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const statusGradient = getStatusGradient(task.status);
  const statusBg = STATUS_BG_COLORS[task.status] || STATUS_BG_COLORS.UNCONFIRMED;
  const statusName = task.statusName || STATUS_NAMES[task.status];

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

              {/* 일정 */}
              {task.scheduleStartDate && (
                <Text fontSize={12} color="$gray400" fontWeight="500">
                  {task.scheduleStartDate}
                </Text>
              )}
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
              {task.title}
            </Text>

            {/* 내용 미리보기 */}
            {task.content && (
              <Text fontSize={14} color="$gray500" numberOfLines={1} marginBottom="$3">
                {task.content}
              </Text>
            )}

            {!compact && (
              <>
                {/* 구분선 */}
                <YStack height={1} backgroundColor="$gray100" marginBottom="$3" />

                {/* 담당자 + 팀 */}
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$1" alignItems="center">
                    <Text fontSize={13} color="$gray400">
                      담당:
                    </Text>
                    <Text fontSize={13} fontWeight="600" color="$gray700">
                      {task.assigneeName || '-'}
                    </Text>
                  </XStack>

                  {task.teamName && (
                    <XStack
                      backgroundColor={
                        statusBg as `rgba(${number}, ${number}, ${number}, ${number})`
                      }
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={6}
                    >
                      <Text fontSize={12} fontWeight="600" color="$primary">
                        {task.teamName}
                      </Text>
                    </XStack>
                  )}
                </XStack>

                {/* 확인 정보 (확인완료 상태일 때) */}
                {task.status === 'CONFIRMED' && task.confirmedAt && (
                  <XStack marginTop="$2" gap="$1" alignItems="center">
                    <Text fontSize={12} color="$gray400">
                      확인:
                    </Text>
                    <Text fontSize={12} color="$success">
                      {task.confirmedByName} ({task.confirmedAt.split(' ')[0]})
                    </Text>
                  </XStack>
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

export default PersonalTaskCard;
