/**
 * 알람 통계 요약 카드 컴포넌트
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@/components/ui/Card';
import type { AlarmStats } from '../types/alarm.types';
import { getAlarmSeverityColor, getAlarmSeverityIcon } from '../constants/alarmColors';

interface AlarmSummaryCardProps {
  stats: AlarmStats;
}

/**
 * 알람 통계 요약 카드
 */
export function AlarmSummaryCard({ stats }: AlarmSummaryCardProps) {
  return (
    <Card marginHorizontal="$4" marginVertical="$3" padding="$4">
      <YStack gap="$3">
        {/* 헤더 */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={18} fontWeight="700" color="$gray900">
            알람 현황
          </Text>
          {stats.unacknowledged > 0 && (
            <XStack
              backgroundColor="$error"
              paddingHorizontal="$3"
              paddingVertical={4}
              borderRadius="$full"
            >
              <Text fontSize={12} fontWeight="600" color="$white">
                미확인 {stats.unacknowledged}건
              </Text>
            </XStack>
          )}
        </XStack>

        {/* 통계 그리드 */}
        <XStack gap="$3" justifyContent="space-between">
          {/* 전체 */}
          <YStack
            flex={1}
            backgroundColor="$gray50"
            padding="$3"
            borderRadius="$3"
            alignItems="center"
          >
            <Text fontSize={24} fontWeight="700" color="$gray900">
              {stats.total}
            </Text>
            <Text fontSize={13} color="$gray600" marginTop="$1">
              전체
            </Text>
          </YStack>

          {/* 심각 */}
          <YStack
            flex={1}
            backgroundColor={(getAlarmSeverityColor('CRITICAL') + '10') as any}
            padding="$3"
            borderRadius="$3"
            alignItems="center"
          >
            <XStack alignItems="center" gap="$1">
              <Text fontSize={20}>{getAlarmSeverityIcon('CRITICAL')}</Text>
              <Text fontSize={24} fontWeight="700" color={getAlarmSeverityColor('CRITICAL') as any}>
                {stats.critical}
              </Text>
            </XStack>
            <Text fontSize={13} color="$gray600" marginTop="$1">
              심각
            </Text>
          </YStack>

          {/* 경고 */}
          <YStack
            flex={1}
            backgroundColor={(getAlarmSeverityColor('WARNING') + '10') as any}
            padding="$3"
            borderRadius="$3"
            alignItems="center"
          >
            <XStack alignItems="center" gap="$1">
              <Text fontSize={20}>{getAlarmSeverityIcon('WARNING')}</Text>
              <Text fontSize={24} fontWeight="700" color={getAlarmSeverityColor('WARNING') as any}>
                {stats.warning}
              </Text>
            </XStack>
            <Text fontSize={13} color="$gray600" marginTop="$1">
              경고
            </Text>
          </YStack>

          {/* 정보 */}
          <YStack
            flex={1}
            backgroundColor={(getAlarmSeverityColor('INFO') + '10') as any}
            padding="$3"
            borderRadius="$3"
            alignItems="center"
          >
            <XStack alignItems="center" gap="$1">
              <Text fontSize={20}>{getAlarmSeverityIcon('INFO')}</Text>
              <Text fontSize={24} fontWeight="700" color={getAlarmSeverityColor('INFO') as any}>
                {stats.info}
              </Text>
            </XStack>
            <Text fontSize={13} color="$gray600" marginTop="$1">
              정보
            </Text>
          </YStack>
        </XStack>
      </YStack>
    </Card>
  );
}

export default AlarmSummaryCard;
