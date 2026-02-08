/**
 * 홈 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glassmorphism 카드
 * 오늘의 요약, 진행 중인 작업, 순찰 상태 표시
 */
import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Platform, ViewStyle, View } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { QuickStatCard } from '@/components/ui/QuickStatCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';

/**
 * 홈 화면
 */
export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: 실제 데이터 갱신
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Mock 데이터 (실제로는 API에서 가져옴)
  const todayStats = {
    work: 5,
    patrol: 2,
    alarm: 1,
    completed: 3,
  };

  const inProgressWork = {
    id: 1,
    title: '공조기 정기점검',
    location: 'A동 3층',
    progress: 80,
  };

  const todayPatrol = {
    id: 1,
    title: 'A동 정기순찰',
    floorsTotal: 5,
    floorsCompleted: 2,
  };

  return (
    <YStack flex={1} backgroundColor="$gray50">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0066CC"
            colors={['#0066CC']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 그라디언트 헤더 */}
        <GradientHeader
          subtitle="안녕하세요,"
          title={`${user?.name ?? '사용자'}님`}
          rightAction={
            <YStack
              backgroundColor="rgba(255, 255, 255, 0.2)"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius={12}
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.3)"
            >
              <Text fontSize={12} fontWeight="600" color="$white">
                {user?.siteName ?? '현장'}
              </Text>
            </YStack>
          }
          height={180}
        />

        {/* 오늘의 요약 (Glass Card - 오버랩) */}
        <View>
          <GlassCard
            marginHorizontal={20}
            marginTop={-32}
            floating
            intensity="heavy"
          >
            <Text fontSize={15} fontWeight="700" color="$gray900" marginBottom="$4">
              오늘의 업무 현황
            </Text>
            <XStack gap="$3">
              <QuickStatCard
                icon="📋"
                value={todayStats.work}
                label="작업"
                variant="primary"
                onPress={() => router.push('/(main)/work')}
              />
              <QuickStatCard
                icon="🚶"
                value={todayStats.patrol}
                label="순찰"
                variant="accent"
                onPress={() => router.push('/(main)/patrol')}
              />
              <QuickStatCard
                icon="⚠️"
                value={todayStats.alarm}
                label="알람"
                variant="warning"
                onPress={() => router.push('/(main)/dashboard/alarm')}
              />
              <QuickStatCard
                icon="✅"
                value={todayStats.completed}
                label="완료"
                variant="success"
              />
            </XStack>
          </GlassCard>
        </View>

        {/* 빠른 실행 */}
        <View>
          <YStack paddingHorizontal="$5" marginTop="$6">
            <SectionHeader title="빠른 실행" showAccent />
            <XStack gap="$3">
              <QuickActionButton
                icon="📋"
                label="작업지시"
                onPress={() => router.push('/(main)/work')}
              />
              <QuickActionButton
                icon="🚶"
                label="순찰점검"
                onPress={() => router.push('/(main)/patrol')}
              />
              <QuickActionButton
                icon="📊"
                label="대시보드"
                onPress={() => router.push('/(main)/dashboard')}
              />
              <QuickActionButton
                icon="📱"
                label="NFC 스캔"
                onPress={() => router.push('/(main)/(tabs)/scan')}
              />
            </XStack>
          </YStack>
        </View>

        {/* 진행 중인 작업 */}
        <View>
          <YStack paddingHorizontal="$5" marginTop="$6">
            <SectionHeader
              title="진행 중인 작업"
              actionText="전체보기"
              onAction={() => router.push('/(main)/work')}
              showAccent
            />
            <WorkInProgressCard
              title={inProgressWork.title}
              location={inProgressWork.location}
              progress={inProgressWork.progress}
              onPress={() => router.push(`/work/${inProgressWork.id}`)}
            />
          </YStack>
        </View>

        {/* 오늘의 순찰 */}
        <View>
          <YStack paddingHorizontal="$5" marginTop="$6">
            <SectionHeader
              title="오늘의 순찰"
              actionText="전체보기"
              onAction={() => router.push('/(main)/patrol')}
              showAccent
            />
            <PatrolStatusCard
              title={todayPatrol.title}
              floorsTotal={todayPatrol.floorsTotal}
              floorsCompleted={todayPatrol.floorsCompleted}
              onPress={() => router.push(`/patrol/${todayPatrol.id}`)}
            />
          </YStack>
        </View>

        {/* 공지사항 */}
        <View>
          <YStack paddingHorizontal="$5" marginTop="$6">
            <SectionHeader title="공지사항" showAccent />
            <NoticeCard
              title="시스템 점검 안내"
              content="2026년 2월 15일 새벽 2시~4시 시스템 점검이 예정되어 있습니다."
              date="2026-02-08"
            />
          </YStack>
        </View>
      </ScrollView>
    </YStack>
  );
}

/**
 * 빠른 실행 버튼
 */
interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  return (
    <YStack
      flex={1}
      backgroundColor="$surface"
      borderRadius={16}
      padding="$3"
      alignItems="center"
      gap="$2"
      pressStyle={{ opacity: 0.8, scale: 0.97 }}
      onPress={onPress}
      style={Platform.select({
        ios: {
          shadowColor: '#0066CC',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 3,
        },
      }) as ViewStyle}
    >
      <Text fontSize={24}>{icon}</Text>
      <Text fontSize={12} fontWeight="500" color="$gray700">
        {label}
      </Text>
    </YStack>
  );
}

/**
 * 진행 중인 작업 카드
 */
interface WorkInProgressCardProps {
  title: string;
  location: string;
  progress: number;
  onPress: () => void;
}

function WorkInProgressCard({
  title,
  location,
  progress,
  onPress,
}: WorkInProgressCardProps) {
  return (
    <YStack
      backgroundColor="$surface"
      borderRadius={20}
      padding="$4"
      pressStyle={{ opacity: 0.95, scale: 0.99 }}
      onPress={onPress}
      style={Platform.select({
        ios: {
          shadowColor: '#0066CC',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
        },
        android: {
          elevation: 6,
        },
      }) as ViewStyle}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
        <YStack flex={1} gap="$1">
          <XStack gap="$2" alignItems="center">
            <Text fontSize={20}>🔧</Text>
            <Text fontSize={16} fontWeight="700" color="$gray900" letterSpacing={-0.3}>
              {title}
            </Text>
          </XStack>
          <XStack gap="$2" alignItems="center">
            <Text fontSize={13} color="$gray500">{location}</Text>
            <Text fontSize={13} color="$gray300">|</Text>
            <XStack alignItems="center" gap="$1">
              <YStack
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor="$secondary"
              />
              <Text fontSize={13} color="$secondary" fontWeight="600">진행중</Text>
            </XStack>
          </XStack>
        </YStack>
      </XStack>

      <ProgressBar
        progress={progress}
        variant="accent"
        height={8}
        glow
        animated
      />

      <Text
        fontSize={12}
        color="$gray500"
        textAlign="right"
        marginTop="$2"
      >
        {progress}% 완료
      </Text>
    </YStack>
  );
}

/**
 * 순찰 상태 카드
 */
interface PatrolStatusCardProps {
  title: string;
  floorsTotal: number;
  floorsCompleted: number;
  onPress: () => void;
}

function PatrolStatusCard({
  title,
  floorsTotal,
  floorsCompleted,
  onPress,
}: PatrolStatusCardProps) {
  const progress = Math.round((floorsCompleted / floorsTotal) * 100);

  return (
    <YStack
      backgroundColor="$surface"
      borderRadius={20}
      padding="$4"
      pressStyle={{ opacity: 0.95, scale: 0.99 }}
      onPress={onPress}
      style={Platform.select({
        ios: {
          shadowColor: '#0066CC',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
        },
        android: {
          elevation: 6,
        },
      }) as ViewStyle}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2" alignItems="center" flex={1}>
          <Text fontSize={20}>🚶</Text>
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="700" color="$gray900" letterSpacing={-0.3}>
              {title}
            </Text>
            <Text fontSize={13} color="$gray500">
              {floorsTotal}층 중 {floorsCompleted}층 완료
            </Text>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap="$1">
          <YStack
            width={8}
            height={8}
            borderRadius={4}
            backgroundColor="$secondary"
          />
          <Text fontSize={13} color="$secondary" fontWeight="600">진행중</Text>
        </XStack>
      </XStack>

      <YStack marginTop="$3">
        <ProgressBar
          progress={progress}
          variant="primary"
          height={6}
          animated
        />
      </YStack>
    </YStack>
  );
}

/**
 * 공지사항 카드
 */
interface NoticeCardProps {
  title: string;
  content: string;
  date: string;
}

function NoticeCard({ title, content, date }: NoticeCardProps) {
  return (
    <YStack
      backgroundColor="$surface"
      borderRadius={16}
      padding="$4"
      style={Platform.select({
        ios: {
          shadowColor: '#0066CC',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 3,
        },
      }) as ViewStyle}
    >
      <Text fontSize={15} fontWeight="700" color="$gray900" marginBottom="$2">
        {title}
      </Text>
      <Text fontSize={14} color="$gray600" lineHeight={20} marginBottom="$2">
        {content}
      </Text>
      <Text fontSize={12} color="$gray400">
        {date}
      </Text>
    </YStack>
  );
}
