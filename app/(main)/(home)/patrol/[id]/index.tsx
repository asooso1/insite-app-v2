/**
 * 순찰점검 상세 화면
 *
 * 2026 Modern UI - 프로그레스 링, 플로팅 카드, 아코디언
 * 순찰 경로, 체크포인트 목록, 완료 상태 표시
 * 시니어 모드 지원: 확대된 텍스트, 큰 프로그레스 링, 고대비 색상
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing, FloorAccordion } from '@/features/patrol/components';
import { mockPatrolDetails } from '@/features/patrol/data/mockPatrols';
import type { CheckpointDTO } from '@/features/patrol/types/patrol.types';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

export default function PatrolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSeniorMode, card: cardStyles } = useSeniorStyles();

  // Mock 데이터 가져오기
  const patrolDetail = useMemo(() => {
    const patrolId = parseInt(id || '0', 10);
    return mockPatrolDetails[patrolId];
  }, [id]);

  // 체크포인트 클릭 핸들러
  const handleCheckpointPress = (checkpoint: CheckpointDTO) => {
    // TODO: 다음 태스크에서 점검 입력 화면으로 이동
    console.log('체크포인트 선택:', checkpoint.name);
  };

  // 순찰 완료 요청 핸들러
  const handleCompletePatrol = () => {
    // TODO: 순찰 완료 로직 구현
    console.log('순찰 완료 요청');
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    router.back();
  };

  if (!patrolDetail) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <YStack
            width={80}
            height={80}
            borderRadius="$full"
            backgroundColor="$gray100"
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <Text fontSize={36}>🔍</Text>
          </YStack>
          <Text fontSize={18} fontWeight="700" color="$gray800" marginBottom="$2">
            순찰 정보를 찾을 수 없습니다
          </Text>
          <Text fontSize={14} color="$gray500" textAlign="center" marginBottom="$6">
            요청하신 순찰 정보가 존재하지 않습니다.
          </Text>
          <Button onPress={handleBack} variant="outline">
            돌아가기
          </Button>
        </YStack>
      </View>
    );
  }

  // 완료율 계산
  const completionRate =
    patrolDetail.totalCheckpoints > 0
      ? Math.round((patrolDetail.completedCheckpoints / patrolDetail.totalCheckpoints) * 100)
      : 0;

  // 상태별 그라디언트
  const statusGradient = getStatusGradient(patrolDetail.state);
  const progressColorType =
    patrolDetail.state === 'COMPLETED'
      ? 'success'
      : patrolDetail.state === 'PROCESSING'
        ? 'warning'
        : 'primary';

  // 첫 번째 미완료 층 찾기 (자동 펼치기용)
  const firstIncompleteFloorIndex = patrolDetail.floors.findIndex(
    (floor) => floor.completionRate < 100
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 그라디언트 헤더 */}
      <View>
        <LinearGradient
          colors={statusGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 8 }]}
        >
          {/* 배경 장식 */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          {/* 상단 네비게이션 */}
          <XStack
            paddingHorizontal="$4"
            paddingBottom="$2"
            justifyContent="space-between"
            alignItems="center"
            zIndex={1}
          >
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Text fontSize={20} color="white">
                ←
              </Text>
            </Pressable>

            <Badge
              backgroundColor="rgba(255, 255, 255, 0.25)"
              color="white"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.4)"
              paddingHorizontal="$3"
              paddingVertical="$1"
            >
              {patrolDetail.stateName}
            </Badge>
          </XStack>

          {/* 제목 영역 */}
          <YStack paddingHorizontal="$5" paddingBottom="$4" gap="$1" zIndex={1}>
            <Text
              fontSize={24}
              fontWeight="800"
              color="white"
              letterSpacing={-0.5}
              numberOfLines={2}
            >
              {patrolDetail.name}
            </Text>
            <XStack gap="$2" marginTop="$1">
              <Badge backgroundColor="rgba(255, 255, 255, 0.2)" color="white" size="sm">
                {patrolDetail.buildingName}
              </Badge>
              <Badge backgroundColor="rgba(255, 255, 255, 0.2)" color="white" size="sm">
                {patrolDetail.floorCount}개 층
              </Badge>
            </XStack>
          </YStack>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로그레스 링 카드 */}
        <View>
          <YStack
            marginHorizontal="$4"
            marginTop={-40}
            backgroundColor="$white"
            borderRadius="$5"
            padding="$5"
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
            style={styles.progressCard}
          >
            <XStack alignItems="center" gap="$5">
              {/* 프로그레스 링 (시니어 모드: 크기 확대) */}
              <ProgressRing
                progress={completionRate}
                size={isSeniorMode ? 130 : 110}
                strokeWidth={isSeniorMode ? 14 : 12}
                colorType={progressColorType}
                subtitle="완료율"
              />

              {/* 상세 통계 */}
              <YStack flex={1} gap="$3">
                <StatRow
                  icon="📍"
                  label="체크포인트"
                  value={`${patrolDetail.completedCheckpoints}/${patrolDetail.totalCheckpoints}`}
                  subtext="완료"
                />
                <StatRow
                  icon="🏢"
                  label="층별 진행"
                  value={`${patrolDetail.completedFloors}/${patrolDetail.floorCount}`}
                  subtext="층 완료"
                />
                <StatRow icon="📅" label="예정일" value={formatDate(patrolDetail.scheduledDate)} />
              </YStack>
            </XStack>
          </YStack>
        </View>

        {/* 층별 체크포인트 섹션 헤더 */}
        <View>
          <XStack
            paddingHorizontal="$5"
            paddingTop="$5"
            paddingBottom="$2"
            gap="$2"
            alignItems="center"
          >
            <Text fontSize={18}>🏗️</Text>
            <Text fontSize={18} fontWeight="700" color="$gray800" letterSpacing={-0.3}>
              층별 체크포인트
            </Text>
          </XStack>
        </View>

        {/* 층별 아코디언 목록 */}
        <YStack paddingBottom="$4">
          {patrolDetail.floors.map((floor, index) => (
            <View key={floor.buildingFloorId}>
              <FloorAccordion
                floor={floor}
                onCheckpointPress={handleCheckpointPress}
                defaultExpanded={index === firstIncompleteFloorIndex || index === 0}
              />
            </View>
          ))}
        </YStack>
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient
          colors={['rgba(248, 250, 252, 0)', 'rgba(248, 250, 252, 1)']}
          style={styles.bottomGradient}
        />
        <YStack paddingHorizontal="$4" paddingTop="$3">
          <Pressable
            onPress={handleCompletePatrol}
            disabled={patrolDetail.state === 'COMPLETED'}
            style={({ pressed }) => [
              styles.completeButton,
              patrolDetail.state === 'COMPLETED' && styles.completeButtonDisabled,
              pressed && styles.completeButtonPressed,
            ]}
          >
            <LinearGradient
              colors={
                patrolDetail.state === 'COMPLETED' ? ['#94A3B8', '#CBD5E1'] : ['#0066CC', '#00A3FF']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.completeButtonGradient}
            >
              <Text fontSize={17} fontWeight="700" color="white">
                {patrolDetail.state === 'COMPLETED' ? '완료된 순찰' : '순찰 완료 요청'}
              </Text>
            </LinearGradient>
          </Pressable>
        </YStack>
      </View>
    </View>
  );
}

/**
 * 통계 행 컴포넌트 (시니어 모드 지원)
 */
function StatRow({
  icon,
  label,
  value,
  subtext,
}: {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
}) {
  const { isSeniorMode, fontSize, iconSize } = useSeniorStyles();

  return (
    <XStack alignItems="center" gap="$2">
      <Text fontSize={isSeniorMode ? iconSize.small : 14}>{icon}</Text>
      <YStack flex={1}>
        <Text fontSize={isSeniorMode ? fontSize.small : 12} color="$gray500">
          {label}
        </Text>
        <XStack alignItems="baseline" gap="$1">
          <Text fontSize={isSeniorMode ? fontSize.medium : 15} fontWeight="700" color="$gray900">
            {value}
          </Text>
          {subtext && (
            <Text fontSize={isSeniorMode ? fontSize.small : 12} color="$gray500">
              {subtext}
            </Text>
          )}
        </XStack>
      </YStack>
    </XStack>
  );
}

/**
 * 상태별 그라디언트 색상 반환
 */
function getStatusGradient(state: string): readonly [string, string] {
  switch (state) {
    case 'COMPLETED':
      return ['#00C853', '#69F0AE'] as const;
    case 'PROCESSING':
      return ['#FF8F00', '#FFB300'] as const;
    case 'ISSUE':
    default:
      return ['#0066CC', '#00A3FF'] as const;
  }
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
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
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -60,
    right: -30,
  },
  headerDecor2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -20,
    left: -15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  progressCard: {
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  completeButtonDisabled: {
    shadowOpacity: 0.1,
  },
  completeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  completeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
