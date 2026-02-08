/**
 * 운영 대시보드 화면
 *
 * Sprint 3.4 - 운영 통계 및 차트 표시
 */
import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DashboardHeader,
  WorkStatsCard,
  PatrolStatsCard,
  WorkStatusChart,
  PatrolStatusChart,
} from '../../../src/features/dashboard';
import { mockDashboardStats } from '../../../src/features/dashboard';
import { SkeletonCard } from '../../../src/components/ui';

/**
 * 운영 대시보드 화면
 */
export default function OperationDashboard() {
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 데이터 새로고침
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TODO: API 호출로 실제 데이터 로드
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top']}>
        <DashboardHeader title="운영 대시보드" subtitle="오늘의 작업 및 순찰 현황" />
        <ScrollView>
          <YStack padding="$4" gap="$4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </YStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top']}>
      <DashboardHeader title="운영 대시보드" subtitle="오늘의 작업 및 순찰 현황" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack padding="$4" gap="$4">
          {/* 작업 현황 카드 */}
          <WorkStatsCard
            completed={mockDashboardStats.work.completed}
            processing={mockDashboardStats.work.processing}
            pending={mockDashboardStats.work.pending}
            total={mockDashboardStats.work.total}
          />

          {/* 순찰 현황 카드 */}
          <PatrolStatsCard
            completed={mockDashboardStats.patrol.completed}
            processing={mockDashboardStats.patrol.processing}
            notStarted={mockDashboardStats.patrol.notStarted}
            total={mockDashboardStats.patrol.total}
          />

          {/* 작업 현황 차트 */}
          <WorkStatusChart data={mockDashboardStats.work} />

          {/* 순찰 현황 차트 */}
          <PatrolStatusChart data={mockDashboardStats.patrol} />

          {/* 하단 여백 */}
          <YStack height={20} />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
