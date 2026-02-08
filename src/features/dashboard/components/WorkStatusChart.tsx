/**
 * 작업 현황 차트 컴포넌트
 *
 * 작업 상태별 현황을 시각화하는 차트
 * 외부 라이브러리 없이 Tamagui로 구현
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '../../../components/ui';
import type { WorkStats } from '../types/dashboard.types';

interface WorkStatusChartProps {
  data: WorkStats;
}

/**
 * 작업 현황 차트 컴포넌트
 */
export function WorkStatusChart({ data }: WorkStatusChartProps) {
  const { total, completed, processing, pending } = data;

  // 각 상태별 비율 계산
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const processingPct = total > 0 ? (processing / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  return (
    <Card variant="elevated" size="md">
      <YStack gap="$4">
        {/* 헤더 */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={16} fontWeight="700" color="$gray900">
            작업 현황
          </Text>
          <Text fontSize={14} color="$gray600">
            총 {total}건
          </Text>
        </XStack>

        {/* 스택 바 차트 */}
        <YStack gap="$2">
          <XStack height={32} borderRadius="$3" overflow="hidden">
            {/* 완료 */}
            {completed > 0 && (
              <YStack
                flex={completed}
                backgroundColor="$success"
                alignItems="center"
                justifyContent="center"
              >
                {completedPct >= 15 && (
                  <Text fontSize={12} fontWeight="600" color="$white">
                    {completed}
                  </Text>
                )}
              </YStack>
            )}

            {/* 진행중 */}
            {processing > 0 && (
              <YStack
                flex={processing}
                backgroundColor="$warning"
                alignItems="center"
                justifyContent="center"
              >
                {processingPct >= 15 && (
                  <Text fontSize={12} fontWeight="600" color="$white">
                    {processing}
                  </Text>
                )}
              </YStack>
            )}

            {/* 대기 */}
            {pending > 0 && (
              <YStack
                flex={pending}
                backgroundColor="$gray400"
                alignItems="center"
                justifyContent="center"
              >
                {pendingPct >= 15 && (
                  <Text fontSize={12} fontWeight="600" color="$white">
                    {pending}
                  </Text>
                )}
              </YStack>
            )}
          </XStack>

          {/* 범례 */}
          <XStack justifyContent="space-around" marginTop="$2">
            <LegendItem
              color="$success"
              label="완료"
              value={completed}
              percentage={Math.round(completedPct)}
            />
            <LegendItem
              color="$warning"
              label="진행중"
              value={processing}
              percentage={Math.round(processingPct)}
            />
            <LegendItem
              color="$gray400"
              label="대기"
              value={pending}
              percentage={Math.round(pendingPct)}
            />
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
}

/**
 * 범례 아이템
 */
function LegendItem({
  color,
  label,
  value,
  percentage,
}: {
  color: string;
  label: string;
  value: number;
  percentage: number;
}) {
  return (
    <YStack alignItems="center" gap="$1">
      <XStack alignItems="center" gap="$2">
        <YStack width={12} height={12} style={{ backgroundColor: color }} borderRadius="$1" />
        <Text fontSize={12} color="$gray700">
          {label}
        </Text>
      </XStack>
      <Text fontSize={16} fontWeight="700" color="$gray900">
        {value}
      </Text>
      <Text fontSize={11} color="$gray500">
        ({percentage}%)
      </Text>
    </YStack>
  );
}

export default WorkStatusChart;
