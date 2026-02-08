/**
 * 작업지시 카드 컴포넌트
 *
 * 작업지시 목록에서 사용되는 카드 UI
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { WorkOrderDTO } from '@/api/generated/models';
import { getStatusBgColor, getStatusTextColor } from '../utils/statusColors';

interface WorkOrderCardProps {
  workOrder: WorkOrderDTO;
  onPress?: (workOrder: WorkOrderDTO) => void;
}

/**
 * 작업지시 카드
 */
export function WorkOrderCard({ workOrder, onPress }: WorkOrderCardProps) {
  const handlePress = () => {
    onPress?.(workOrder);
  };

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <Card
          marginHorizontal="$4"
          marginVertical="$2"
          opacity={pressed ? 0.8 : 1}
          scale={pressed ? 0.98 : 1}
        >
          {/* 헤더: 제목과 상태 */}
          <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
            <YStack flex={1} marginRight="$2">
              <Text fontSize={16} fontWeight="600" color="$gray900" numberOfLines={2}>
                {workOrder.name}
              </Text>
            </YStack>

            <Badge
              style={{
                backgroundColor: getStatusBgColor(workOrder.state),
                color: getStatusTextColor(workOrder.state),
              }}
              borderWidth={0}
              paddingHorizontal="$3"
              paddingVertical={6}
              fontSize={12}
            >
              {workOrder.stateName}
            </Badge>
          </XStack>

          {/* 분류 정보 */}
          <XStack gap="$2" marginBottom="$2" flexWrap="wrap">
            <Badge variant="default" size="sm">
              {workOrder.firstClassName}
            </Badge>
            {workOrder.secondClassName && (
              <Badge variant="default" size="sm">
                {workOrder.secondClassName}
              </Badge>
            )}
          </XStack>

          {/* 상세 정보 */}
          <YStack gap="$2">
            {/* 건물 */}
            {workOrder.buildingName && (
              <XStack gap="$2" alignItems="center">
                <Text fontSize={13} color="$gray500" width={60}>
                  건물
                </Text>
                <Text fontSize={13} color="$gray700" flex={1}>
                  {workOrder.buildingName}
                </Text>
              </XStack>
            )}


            {/* 작성자 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize={13} color="$gray500" width={60}>
                작성자
              </Text>
              <Text fontSize={13} color="$gray700" flex={1}>
                {workOrder.writerName}
              </Text>
            </XStack>

            {/* 계획 기간 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize={13} color="$gray500" width={60}>
                계획 기간
              </Text>
              <Text fontSize={13} color="$gray700" flex={1}>
                {workOrder.planStartDate} ~ {workOrder.planEndDate}
              </Text>
            </XStack>

            {/* 작성일 */}
            <XStack gap="$2" alignItems="center">
              <Text fontSize={13} color="$gray500" width={60}>
                작성일
              </Text>
              <Text fontSize={13} color="$gray700" flex={1}>
                {workOrder.writeDate}
              </Text>
            </XStack>

            {/* 항목 수 */}
            {workOrder.itemSize !== undefined && workOrder.itemSize > 0 && (
              <XStack gap="$2" alignItems="center">
                <Text fontSize={13} color="$gray500" width={60}>
                  항목 수
                </Text>
                <Text fontSize={13} color="$primary" flex={1} fontWeight="600">
                  {workOrder.itemSize}개
                </Text>
              </XStack>
            )}
          </YStack>
        </Card>
      )}
    </Pressable>
  );
}

export default WorkOrderCard;
