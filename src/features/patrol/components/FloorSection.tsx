/**
 * 층별 구역 섹션 컴포넌트
 *
 * 층 헤더 + 구역별 체크포인트 목록을 아코디언 형태로 표시
 */
import React, { useState } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { CheckpointCard } from './CheckpointCard';
import type { FloorDTO, CheckpointDTO } from '../types/patrol.types';

interface FloorSectionProps {
  floor: FloorDTO;
  onCheckpointPress?: (checkpoint: CheckpointDTO) => void;
  /** 기본 펼침 여부 */
  defaultExpanded?: boolean;
}

/**
 * 층별 섹션 컴포넌트
 */
export function FloorSection({
  floor,
  onCheckpointPress,
  defaultExpanded = false,
}: FloorSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // 총 체크포인트 수와 완료된 체크포인트 수 계산
  const totalCheckpoints = floor.zones.reduce(
    (sum, zone) => sum + zone.checkpoints.length,
    0
  );
  const completedCheckpoints = floor.zones.reduce(
    (sum, zone) =>
      sum + zone.checkpoints.filter((cp) => cp.status === 'COMPLETED').length,
    0
  );

  return (
    <YStack marginBottom="$3">
      {/* 층 헤더 */}
      <Pressable onPress={handleToggle}>
        {({ pressed }) => (
          <Card
            marginHorizontal="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            opacity={pressed ? 0.8 : 1}
            backgroundColor={expanded ? '$gray100' : '$white'}
          >
            <XStack justifyContent="space-between" alignItems="center">
              {/* 왼쪽: 층명 + 완료율 */}
              <XStack gap="$3" alignItems="center" flex={1}>
                <Text fontSize={18} fontWeight="bold" color="$gray400">
                  {expanded ? '▼' : '▶'}
                </Text>
                <YStack flex={1}>
                  <Text fontSize={16} fontWeight="600" color="$gray900">
                    {floor.buildingFloorName}
                  </Text>
                  <Text fontSize={13} color="$gray500" marginTop="$1">
                    {completedCheckpoints}/{totalCheckpoints} 완료
                  </Text>
                </YStack>
              </XStack>

              {/* 오른쪽: 완료율 */}
              <XStack alignItems="center" gap="$2">
                <XStack
                  width={60}
                  height={6}
                  backgroundColor="$gray200"
                  borderRadius="$full"
                  overflow="hidden"
                >
                  <XStack
                    width={`${floor.completionRate}%`}
                    backgroundColor={
                      floor.completionRate === 100 ? '$success' : '$warning'
                    }
                  />
                </XStack>
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color={floor.completionRate === 100 ? '$success' : '$gray600'}
                  width={45}
                  textAlign="right"
                >
                  {floor.completionRate}%
                </Text>
              </XStack>
            </XStack>
          </Card>
        )}
      </Pressable>

      {/* 구역별 체크포인트 목록 */}
      {expanded && (
        <YStack paddingTop="$2">
          {floor.zones.map((zone) => (
            <YStack key={zone.buildingFloorZoneId} marginBottom="$3">
              {/* 구역명 헤더 */}
              <XStack
                paddingHorizontal="$5"
                paddingVertical="$2"
                alignItems="center"
                gap="$2"
              >
                <Text fontSize={14} fontWeight="600" color="$gray700">
                  {zone.buildingFloorZoneName}
                </Text>
                <Text fontSize={12} color="$gray500">
                  ({zone.checkpoints.length}개)
                </Text>
              </XStack>

              {/* 체크포인트 카드 목록 */}
              {zone.checkpoints.map((checkpoint) => (
                <CheckpointCard
                  key={checkpoint.id}
                  checkpoint={checkpoint}
                  onPress={onCheckpointPress}
                />
              ))}
            </YStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

export default FloorSection;
