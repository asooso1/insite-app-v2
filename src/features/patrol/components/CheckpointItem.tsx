/**
 * CheckpointItem 컴포넌트
 *
 * 2026 Modern UI - 체크포인트 아이템
 * 상태 아이콘, 연결선, 터치 리플 효과
 */
import React, { useState } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CheckpointDTO } from '../types/patrol.types';

interface CheckpointItemProps {
  checkpoint: CheckpointDTO;
  onPress?: (checkpoint: CheckpointDTO) => void;
  /** 마지막 아이템 여부 (연결선 숨김) */
  isLast?: boolean;
  /** 첫 번째 아이템 여부 */
  isFirst?: boolean;
}

/**
 * 체크포인트 아이템
 */
export function CheckpointItem({
  checkpoint,
  onPress,
  isLast = false,
  isFirst = false,
}: CheckpointItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  // 완료율 계산
  const completionRate =
    checkpoint.itemCount > 0
      ? Math.round((checkpoint.completedItemCount / checkpoint.itemCount) * 100)
      : 0;

  const handlePress = () => {
    onPress?.(checkpoint);
  };

  // 상태별 아이콘과 색상
  const statusConfig = getStatusConfig(checkpoint.status);

  return (
    <XStack paddingHorizontal="$4">
      {/* 연결선 및 상태 아이콘 */}
      <YStack width={32} alignItems="center" marginRight="$2">
        {/* 상단 연결선 */}
        {!isFirst && (
          <View style={[styles.connectorLine, styles.connectorTop]} />
        )}

        {/* 상태 아이콘 */}
        <YStack
          width={28}
          height={28}
          borderRadius="$full"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          zIndex={1}
        >
          <LinearGradient
            colors={statusConfig.gradient}
            style={StyleSheet.absoluteFill}
          />
          <Text fontSize={14} color="white" fontWeight="700">
            {statusConfig.icon}
          </Text>
        </YStack>

        {/* 하단 연결선 */}
        {!isLast && (
          <View style={[styles.connectorLine, styles.connectorBottom]} />
        )}
      </YStack>

      {/* 체크포인트 카드 */}
      <Pressable
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[styles.cardContainer, { transform: [{ scale: isPressed ? 0.97 : 1 }] }]}
      >
        <YStack
          flex={1}
          backgroundColor="$white"
          borderRadius="$3"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderWidth={1}
          borderColor={
            checkpoint.status === 'COMPLETED'
              ? 'rgba(0, 200, 83, 0.3)'
              : '$gray200'
          }
        >
          <XStack justifyContent="space-between" alignItems="center">
            {/* 체크포인트 정보 */}
            <YStack flex={1} gap="$1">
              <Text
                fontSize={15}
                fontWeight="600"
                color="$gray900"
                numberOfLines={1}
              >
                {checkpoint.name}
              </Text>
              <Text fontSize={13} color="$gray500">
                점검항목 {checkpoint.completedItemCount}/{checkpoint.itemCount}
              </Text>
            </YStack>

            {/* 완료율 + 화살표 */}
            <XStack alignItems="center" gap="$2">
              <Text
                fontSize={14}
                fontWeight="700"
                color={
                  checkpoint.status === 'COMPLETED'
                    ? '$success'
                    : checkpoint.status === 'IN_PROGRESS'
                      ? '$warning'
                      : '$gray400'
                }
              >
                {completionRate}%
              </Text>
              <YStack
                width={24}
                height={24}
                borderRadius="$full"
                backgroundColor="$gray100"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={14} color="$gray500">
                  ›
                </Text>
              </YStack>
            </XStack>
          </XStack>

          {/* 미니 프로그레스 바 */}
          {checkpoint.status !== 'COMPLETED' && checkpoint.itemCount > 0 && (
            <YStack marginTop="$2">
              <YStack
                height={3}
                backgroundColor="$gray100"
                borderRadius="$full"
                overflow="hidden"
              >
                <YStack
                  width={`${completionRate}%`}
                  height="100%"
                  backgroundColor={
                    checkpoint.status === 'IN_PROGRESS' ? '$warning' : '$gray300'
                  }
                  borderRadius="$full"
                />
              </YStack>
            </YStack>
          )}
        </YStack>
      </Pressable>
    </XStack>
  );
}

/**
 * 상태별 설정 반환
 */
function getStatusConfig(status: string) {
  switch (status) {
    case 'COMPLETED':
      return {
        icon: '✓',
        gradient: ['#00C853', '#69F0AE'] as const,
      };
    case 'IN_PROGRESS':
      return {
        icon: '◐',
        gradient: ['#FF8F00', '#FFB300'] as const,
      };
    case 'PENDING':
    default:
      return {
        icon: '○',
        gradient: ['#94A3B8', '#CBD5E1'] as const,
      };
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    marginVertical: 4,
  },
  connectorLine: {
    width: 2,
    backgroundColor: '#E2E8F0',
    position: 'absolute',
    left: 13,
  },
  connectorTop: {
    top: 0,
    height: 10,
  },
  connectorBottom: {
    bottom: 0,
    top: 38,
  },
});

export default CheckpointItem;
