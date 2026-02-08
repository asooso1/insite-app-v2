/**
 * 순찰 카드 컴포넌트
 *
 * 순찰 목록에서 사용되는 카드 UI
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { PatrolDTO } from '../types/patrol.types';
import { getPatrolStatusBgColor, getPatrolStatusTextColor } from '../constants/patrolColors';

interface PatrolCardProps {
  patrol: PatrolDTO;
  onPress?: (patrol: PatrolDTO) => void;
  /** 오늘의 순찰 강조 표시 */
  highlighted?: boolean;
}

/**
 * 순찰 카드
 */
export function PatrolCard({ patrol, onPress, highlighted = false }: PatrolCardProps) {
  const handlePress = () => {
    onPress?.(patrol);
  };

  // 완료율 계산
  const completionRate =
    patrol.totalCheckpoints > 0
      ? Math.round((patrol.completedCheckpoints / patrol.totalCheckpoints) * 100)
      : 0;

  // 층별 진행률 계산
  const floorProgress =
    patrol.floorCount > 0
      ? `${patrol.completedFloors}/${patrol.floorCount}`
      : '0/0';

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <Card
          marginHorizontal="$4"
          marginVertical="$2"
          opacity={pressed ? 0.8 : 1}
          scale={pressed ? 0.98 : 1}
          borderColor={highlighted ? '$primary' : '$gray200'}
          borderWidth={highlighted ? 2 : 1}
          backgroundColor={highlighted ? '$gray50' : '$white'}
        >
          {/* 헤더: 제목과 상태 */}
          <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
            <YStack flex={1} marginRight="$2">
              <Text fontSize={16} fontWeight="600" color="$gray900" numberOfLines={2}>
                {patrol.name}
              </Text>
              {highlighted && (
                <Badge
                  variant="primary"
                  size="sm"
                  marginTop="$2"
                  alignSelf="flex-start"
                >
                  오늘의 순찰
                </Badge>
              )}
            </YStack>

            <Badge
              style={{
                backgroundColor: getPatrolStatusBgColor(patrol.state),
                color: getPatrolStatusTextColor(patrol.state),
              }}
              borderWidth={0}
              paddingHorizontal="$3"
              paddingVertical={6}
              fontSize={12}
            >
              {patrol.stateName}
            </Badge>
          </XStack>

          {/* 건물 정보 */}
          <XStack gap="$2" marginBottom="$2" flexWrap="wrap">
            <Badge variant="default" size="sm">
              {patrol.buildingName}
            </Badge>
            <Badge variant="default" size="sm">
              {patrol.floorCount}개 층
            </Badge>
          </XStack>

          {/* 상세 정보 */}
          <YStack gap="$2">
            {/* 층별 진행률 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize={13} color="$gray500" width={80}>
                층별 진행률
              </Text>
              <Text fontSize={13} color="$gray700" flex={1}>
                {floorProgress}
              </Text>
            </XStack>

            {/* 체크포인트 완료율 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize={13} color="$gray500" width={80}>
                체크포인트
              </Text>
              <Text fontSize={13} color="$gray700" flex={1}>
                {patrol.completedCheckpoints}/{patrol.totalCheckpoints}
              </Text>
            </XStack>

            {/* 완료율 바 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize={13} color="$gray500" width={80}>
                완료율
              </Text>
              <YStack flex={1} gap="$1">
                <XStack
                  height={8}
                  backgroundColor="$gray200"
                  borderRadius="$full"
                  overflow="hidden"
                >
                  <XStack
                    width={`${completionRate}%`}
                    backgroundColor={
                      patrol.state === 'COMPLETED'
                        ? '$success'
                        : patrol.state === 'PROCESSING'
                          ? '$warning'
                          : '$info'
                    }
                  />
                </XStack>
                <Text fontSize={12} color="$primary" fontWeight="600">
                  {completionRate}%
                </Text>
              </YStack>
            </XStack>

            {/* 예정 날짜 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize={13} color="$gray500" width={80}>
                예정 날짜
              </Text>
              <Text fontSize={13} color="$gray700" flex={1}>
                {patrol.scheduledDate}
              </Text>
            </XStack>
          </YStack>
        </Card>
      )}
    </Pressable>
  );
}

export default PatrolCard;
