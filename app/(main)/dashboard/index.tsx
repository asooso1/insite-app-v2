/**
 * 운영 대시보드 화면
 *
 * 2026 Modern UI - 그라디언트 헤더, 통계 카드, 도넛/막대 차트
 * 실시간 운영 현황 및 통계 시각화
 * Lucide Icons 사용
 * 시니어 모드 지원: 차트 라벨 크기 확대, 고대비 색상
 */
import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatCardRow, DonutChart, BarChart } from '@/features/dashboard';
import { mockDashboardStats } from '@/features/dashboard';
import { SkeletonCard } from '@/components/ui';
import { LAYOUT } from '@/theme/tokens';
import type { IconName } from '@/components/icons';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

/**
 * 운영 대시보드 화면
 */
export default function OperationDashboard() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [isLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isSeniorMode } = useSeniorStyles();

  // 데이터 새로고침
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TODO: API 호출로 실제 데이터 로드
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  // 통계 카드 데이터
  const statItems = [
    {
      label: '작업',
      value: mockDashboardStats.work.total,
      icon: 'work' as IconName,
      gradient: ['#0066CC', '#00A3FF'] as const,
    },
    {
      label: '순찰',
      value: mockDashboardStats.patrol.total,
      icon: 'patrol' as IconName,
      gradient: ['#FF6B00', '#FFB800'] as const,
    },
    {
      label: '알람',
      value: 3, // Mock 알람 수
      icon: 'alarm' as IconName,
      gradient: ['#EF4444', '#F87171'] as const,
    },
  ];

  // 도넛 차트 데이터 (작업 현황)
  const workChartSegments = [
    {
      label: '완료',
      value: mockDashboardStats.work.completed,
      gradient: ['#00C853', '#69F0AE'] as const,
    },
    {
      label: '진행중',
      value: mockDashboardStats.work.processing,
      gradient: ['#FF8F00', '#FFB300'] as const,
    },
    {
      label: '대기',
      value: mockDashboardStats.work.pending,
      gradient: ['#94A3B8', '#CBD5E1'] as const,
    },
  ];

  // 막대 차트 데이터 (순찰 현황 - 가상의 구역별 데이터)
  const patrolBarItems = [
    { label: 'A동', value: 8, max: 10 },
    { label: 'B동', value: 4, max: 10 },
    { label: 'C동', value: 10, max: 10 },
    { label: 'D동', value: 6, max: 10 },
  ];

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* 헤더 스켈레톤 */}
        <YStack height={100} backgroundColor="$gray200" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <YStack padding="$4" gap="$4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </YStack>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 그라디언트 헤더 */}
      <View>
        <LinearGradient
          colors={['#0066CC', '#00A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
          {/* 배경 장식 */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          <YStack paddingHorizontal="$5" paddingVertical="$4" gap="$1" zIndex={1}>
            <Text fontSize={28} fontWeight="800" color="white" letterSpacing={-0.5}>
              대시보드
            </Text>
            <Text fontSize={15} color="$glassWhite85">
              실시간 현황을 확인하세요
            </Text>
          </YStack>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary.val}
            colors={[theme.primary.val]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 통계 카드 행 */}
        <View>
          <YStack marginTop="$4">
            <StatCardRow items={statItems} animationDelay={200} />
          </YStack>
        </View>

        {/* 작업 현황 도넛 차트 (시니어 모드: 크기 확대) */}
        <View>
          <YStack paddingHorizontal="$4" marginTop="$4">
            <DonutChart
              title="작업 현황"
              segments={workChartSegments}
              size={isSeniorMode ? 150 : 130}
              strokeWidth={isSeniorMode ? 20 : 18}
            />
          </YStack>
        </View>

        {/* 순찰 현황 막대 차트 (시니어 모드: 높이 확대) */}
        <View>
          <YStack paddingHorizontal="$4" marginTop="$4">
            <BarChart
              title="순찰 현황"
              subtitle="구역별 완료 현황"
              items={patrolBarItems}
              barHeight={isSeniorMode ? 32 : 26}
            />
          </YStack>
        </View>

        {/* 주간 추세 섹션 */}
        <View>
          <YStack paddingHorizontal="$4" marginTop="$4">
            <WeeklyTrendCard data={mockDashboardStats.weeklyTrend} />
          </YStack>
        </View>

        {/* 하단 여백 */}
        <YStack height={40} />
      </ScrollView>
    </View>
  );
}

/**
 * 주간 추세 카드 컴포넌트 (시니어 모드 지원)
 */
function WeeklyTrendCard({ data }: { data: { day: string; work: number; patrol: number }[] }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.work, d.patrol)));
  const { isSeniorMode, fontSize, card: cardStyles } = useSeniorStyles();

  return (
    <YStack
      backgroundColor="$white"
      borderRadius="$5"
      padding="$4"
      borderWidth={isSeniorMode ? cardStyles.borderWidth : 1}
      borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'rgba(226, 232, 240, 0.8)'}
      style={styles.card}
    >
      {/* 헤더 */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
        <Text
          fontSize={isSeniorMode ? fontSize.large : 18}
          fontWeight="700"
          color="$gray900"
          letterSpacing={-0.3}
        >
          주간 추세
        </Text>
        <XStack gap="$3">
          <XStack alignItems="center" gap="$1">
            <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
            <Text fontSize={isSeniorMode ? fontSize.small : 12} color="$gray500">
              작업
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$1">
            <View style={[styles.legendDot, { backgroundColor: '#FF6B00' }]} />
            <Text fontSize={isSeniorMode ? fontSize.small : 12} color="$gray500">
              순찰
            </Text>
          </XStack>
        </XStack>
      </XStack>

      {/* 막대 그래프 */}
      <XStack justifyContent="space-between" alignItems="flex-end" height={100}>
        {data.map((item) => (
          <YStack key={item.day} alignItems="center" gap="$2" flex={1}>
            <XStack gap={3} alignItems="flex-end" height={80}>
              {/* 작업 막대 */}
              <View>
                <LinearGradient
                  colors={['#0066CC', '#00A3FF']}
                  style={[styles.trendBar, { height: (item.work / maxValue) * 70 || 4 }]}
                />
              </View>
              {/* 순찰 막대 */}
              <View>
                <LinearGradient
                  colors={['#FF6B00', '#FFB800']}
                  style={[styles.trendBar, { height: (item.patrol / maxValue) * 70 || 4 }]}
                />
              </View>
            </XStack>
            <Text fontSize={isSeniorMode ? fontSize.small : 12} color="$gray500">
              {item.day}
            </Text>
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    width: LAYOUT.DECOR_CIRCLE_LARGE,
    height: LAYOUT.DECOR_CIRCLE_LARGE,
    borderRadius: LAYOUT.DECOR_CIRCLE_LARGE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -80,
    right: -40,
  },
  headerDecor2: {
    position: 'absolute',
    width: LAYOUT.DECOR_CIRCLE_MEDIUM,
    height: LAYOUT.DECOR_CIRCLE_MEDIUM,
    borderRadius: LAYOUT.DECOR_CIRCLE_MEDIUM / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -30,
    left: -20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    shadowColor: '#0066CC', // theme.primary는 StyleSheet.create에서 사용 불가
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendBar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
});
