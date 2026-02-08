/**
 * 체크포인트 카드 컴포넌트
 *
 * 체크포인트 정보를 표시하고 점검 입력 화면으로 이동
 */
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { CheckpointDTO } from '../types/patrol.types';
import { getCheckpointStatusInfo } from '../constants/patrolColors';

interface CheckpointCardProps {
  checkpoint: CheckpointDTO;
  onPress?: (checkpoint: CheckpointDTO) => void;
}

/**
 * 체크포인트 카드
 */
export function CheckpointCard({ checkpoint, onPress }: CheckpointCardProps) {
  const statusInfo = getCheckpointStatusInfo(checkpoint.status);

  const handlePress = () => {
    onPress?.(checkpoint);
  };

  // 완료율 계산
  const completionRate =
    checkpoint.itemCount > 0
      ? Math.round((checkpoint.completedItemCount / checkpoint.itemCount) * 100)
      : 0;

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <Card
          marginHorizontal="$4"
          marginVertical="$2"
          paddingHorizontal="$4"
          paddingVertical="$3"
          opacity={pressed ? 0.8 : 1}
          scale={pressed ? 0.98 : 1}
        >
          <XStack justifyContent="space-between" alignItems="center">
            {/* 왼쪽: 상태 아이콘 + 체크포인트명 */}
            <XStack gap="$3" alignItems="center" flex={1}>
              <Text
                fontSize={24}
                style={{ color: statusInfo.color }}
                lineHeight={24}
                fontWeight="bold"
              >
                {statusInfo.icon}
              </Text>
              <YStack flex={1}>
                <Text fontSize={15} fontWeight="500" color="$gray900" numberOfLines={1}>
                  {checkpoint.name}
                </Text>
                <Text fontSize={13} color="$gray500" marginTop="$1">
                  점검항목 {checkpoint.completedItemCount}/{checkpoint.itemCount}
                </Text>
              </YStack>
            </XStack>

            {/* 오른쪽: 완료율 */}
            <XStack alignItems="center" gap="$2">
              <Text
                fontSize={14}
                fontWeight="600"
                color={checkpoint.status === 'COMPLETED' ? '$success' : '$gray500'}
              >
                {completionRate}%
              </Text>
              <Text fontSize={20} color="$gray400">
                ›
              </Text>
            </XStack>
          </XStack>
        </Card>
      )}
    </Pressable>
  );
}

export default CheckpointCard;
