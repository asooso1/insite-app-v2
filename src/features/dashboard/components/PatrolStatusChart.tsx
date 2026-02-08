/**
 * 순찰 현황 차트 컴포넌트
 *
 * 순찰 완료율과 구역별 현황을 시각화하는 차트
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '../../../components/ui';
import type { PatrolStats } from '../types/dashboard.types';

interface PatrolStatusChartProps {
  data: PatrolStats;
}

/**
 * 순찰 현황 차트 컴포넌트
 */
export function PatrolStatusChart({ data }: PatrolStatusChartProps) {
  const { total, completed, processing, notStarted } = data;

  // 완료율 계산
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card variant="elevated" size="md">
      <YStack gap="$4">
        {/* 헤더 */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={16} fontWeight="700" color="$gray900">
            순찰 현황
          </Text>
          <Text fontSize={14} color="$gray600">
            총 {total}건
          </Text>
        </XStack>

        {/* 완료율 원형 프로그레스 */}
        <YStack alignItems="center" gap="$3" paddingVertical="$4">
          {/* 원형 프로그레스 대체 UI */}
          <YStack alignItems="center" position="relative">
            {/* 배경 원 */}
            <YStack
              width={120}
              height={120}
              borderRadius="$full"
              backgroundColor="$gray100"
              alignItems="center"
              justifyContent="center"
              borderWidth={8}
              borderColor="$gray200"
            >
              {/* 프로그레스 원 (상단에 오버레이) */}
              <YStack
                position="absolute"
                width={120}
                height={120}
                borderRadius="$full"
                borderWidth={8}
                borderColor="$success"
                opacity={completionRate / 100}
              />

              {/* 중앙 텍스트 */}
              <YStack alignItems="center" zIndex={10}>
                <Text fontSize={32} fontWeight="700" color="$success">
                  {completionRate}%
                </Text>
                <Text fontSize={12} color="$gray600" marginTop="$1">
                  완료율
                </Text>
              </YStack>
            </YStack>
          </YStack>

          {/* 상태별 통계 */}
          <XStack gap="$4" justifyContent="center" width="100%">
            <StatusBadge
              label="완료"
              value={completed}
              color="$success"
            />
            <StatusBadge
              label="진행중"
              value={processing}
              color="$warning"
            />
            <StatusBadge
              label="미실시"
              value={notStarted}
              color="$error"
            />
          </XStack>
        </YStack>

        {/* 층별/구역별 현황 (Mock) */}
        <YStack gap="$2" marginTop="$2">
          <Text fontSize={14} fontWeight="600" color="$gray700" marginBottom="$1">
            구역별 완료 현황
          </Text>

          <FloorProgress floor="1층" completed={5} total={8} />
          <FloorProgress floor="2층" completed={8} total={10} />
          <FloorProgress floor="3층" completed={3} total={7} />
        </YStack>
      </YStack>
    </Card>
  );
}

/**
 * 상태 배지 컴포넌트
 */
function StatusBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <YStack alignItems="center" gap="$1">
      <XStack
        paddingHorizontal="$3"
        paddingVertical="$1"
        style={{ backgroundColor: color }}
        borderRadius="$full"
        minWidth={50}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={16} fontWeight="700" color="$white">
          {value}
        </Text>
      </XStack>
      <Text fontSize={11} color="$gray600">
        {label}
      </Text>
    </YStack>
  );
}

/**
 * 층별 프로그레스 컴포넌트
 */
function FloorProgress({
  floor,
  completed,
  total,
}: {
  floor: string;
  completed: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <XStack alignItems="center" gap="$3">
      <Text fontSize={13} color="$gray700" width={40}>
        {floor}
      </Text>

      <YStack flex={1} gap="$1">
        <XStack
          height={20}
          backgroundColor="$gray200"
          borderRadius="$2"
          overflow="hidden"
        >
          <YStack
            width={`${percentage}%`}
            backgroundColor="$success"
            borderRadius="$2"
            alignItems="center"
            justifyContent="center"
          >
            {percentage >= 20 && (
              <Text fontSize={10} fontWeight="600" color="$white">
                {percentage}%
              </Text>
            )}
          </YStack>
        </XStack>
      </YStack>

      <Text fontSize={12} color="$gray600" width={50} textAlign="right">
        {completed}/{total}
      </Text>
    </XStack>
  );
}

export default PatrolStatusChart;
