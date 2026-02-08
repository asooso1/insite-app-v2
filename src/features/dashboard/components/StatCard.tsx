/**
 * 통계 카드 컴포넌트
 *
 * 대시보드에서 사용하는 통계 카드
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '../../../components/ui';
import type { StatCardData } from '../types/dashboard.types';

interface StatCardProps {
  data: StatCardData;
}

/**
 * 통계 카드 컴포넌트
 */
export function StatCard({ data }: StatCardProps) {
  const { title, value, total, change, color } = data;

  // 완료율 계산
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Card variant="elevated" size="md" pressable={false}>
      {/* 헤더 */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
        <Text fontSize={14} fontWeight="600" color="$gray700">
          {title}
        </Text>
        {change !== undefined && (
          <Text
            fontSize={12}
            fontWeight="500"
            color={change >= 0 ? '$success' : '$error'}
          >
            {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
          </Text>
        )}
      </XStack>

      {/* 주요 수치 */}
      <XStack alignItems="baseline" gap="$2" marginBottom="$3">
        <Text fontSize={32} fontWeight="700" style={{ color }}>
          {value}
        </Text>
        <Text fontSize={16} color="$gray500">
          / {total}
        </Text>
      </XStack>

      {/* 프로그레스 바 */}
      <YStack gap="$1">
        <XStack
          height={8}
          backgroundColor="$gray200"
          borderRadius="$full"
          overflow="hidden"
        >
          <YStack
            width={`${percentage}%`}
            style={{ backgroundColor: color }}
            borderRadius="$full"
          />
        </XStack>
        <Text fontSize={12} color="$gray600" textAlign="right">
          {percentage}% 완료
        </Text>
      </YStack>
    </Card>
  );
}

/**
 * 작업 현황 카드
 */
export function WorkStatsCard({
  completed,
  processing,
  pending,
  total,
}: {
  completed: number;
  processing: number;
  pending: number;
  total: number;
}) {
  return (
    <Card variant="elevated" size="md">
      <YStack gap="$3">
        {/* 헤더 */}
        <Text fontSize={16} fontWeight="700" color="$gray900">
          오늘의 작업 현황
        </Text>

        {/* 통계 그리드 */}
        <XStack gap="$3">
          <YStack flex={1} alignItems="center" padding="$3" backgroundColor="$gray50" borderRadius="$2">
            <Text fontSize={24} fontWeight="700" color="$success">
              {completed}
            </Text>
            <Text fontSize={12} color="$gray600" marginTop="$1">
              완료
            </Text>
          </YStack>

          <YStack flex={1} alignItems="center" padding="$3" backgroundColor="$gray50" borderRadius="$2">
            <Text fontSize={24} fontWeight="700" color="$warning">
              {processing}
            </Text>
            <Text fontSize={12} color="$gray600" marginTop="$1">
              진행중
            </Text>
          </YStack>

          <YStack flex={1} alignItems="center" padding="$3" backgroundColor="$gray50" borderRadius="$2">
            <Text fontSize={24} fontWeight="700" color="$gray500">
              {pending}
            </Text>
            <Text fontSize={12} color="$gray600" marginTop="$1">
              대기
            </Text>
          </YStack>
        </XStack>

        {/* 총계 */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingTop="$2"
          borderTopWidth={1}
          borderTopColor="$gray200"
        >
          <Text fontSize={14} color="$gray700">
            총 작업
          </Text>
          <Text fontSize={18} fontWeight="700" color="$primary">
            {total}
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
}

/**
 * 순찰 현황 카드
 */
export function PatrolStatsCard({
  completed,
  processing,
  notStarted,
  total,
}: {
  completed: number;
  processing: number;
  notStarted: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card variant="elevated" size="md">
      <YStack gap="$3">
        {/* 헤더 */}
        <Text fontSize={16} fontWeight="700" color="$gray900">
          오늘의 순찰 현황
        </Text>

        {/* 통계 그리드 */}
        <XStack gap="$3">
          <YStack flex={1} alignItems="center" padding="$3" backgroundColor="$gray50" borderRadius="$2">
            <Text fontSize={24} fontWeight="700" color="$success">
              {completed}
            </Text>
            <Text fontSize={12} color="$gray600" marginTop="$1">
              완료
            </Text>
          </YStack>

          <YStack flex={1} alignItems="center" padding="$3" backgroundColor="$gray50" borderRadius="$2">
            <Text fontSize={24} fontWeight="700" color="$warning">
              {processing}
            </Text>
            <Text fontSize={12} color="$gray600" marginTop="$1">
              진행중
            </Text>
          </YStack>

          <YStack flex={1} alignItems="center" padding="$3" backgroundColor="$gray50" borderRadius="$2">
            <Text fontSize={24} fontWeight="700" color="$error">
              {notStarted}
            </Text>
            <Text fontSize={12} color="$gray600" marginTop="$1">
              미실시
            </Text>
          </YStack>
        </XStack>

        {/* 완료율 프로그레스 */}
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={14} color="$gray700">
              완료율
            </Text>
            <Text fontSize={16} fontWeight="700" color="$primary">
              {percentage}%
            </Text>
          </XStack>
          <XStack
            height={12}
            backgroundColor="$gray200"
            borderRadius="$full"
            overflow="hidden"
          >
            <YStack
              width={`${percentage}%`}
              backgroundColor="$success"
              borderRadius="$full"
            />
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
}

export default StatCard;
