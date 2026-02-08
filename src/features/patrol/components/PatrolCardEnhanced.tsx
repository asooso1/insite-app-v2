/**
 * Enhanced Patrol Card 컴포넌트
 *
 * 2026 Modern UI - Glassmorphism 기반 순찰 카드
 * 플로팅 섀도우, 그라디언트 액센트, 애니메이션
 */
import React, { useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '@/components/ui/Badge';
import type { PatrolDTO } from '../types/patrol.types';
// 상태별 그라디언트는 로컬에서 처리

interface PatrolCardEnhancedProps {
  patrol: PatrolDTO;
  onPress?: (patrol: PatrolDTO) => void;
  /** 오늘의 순찰 강조 표시 */
  highlighted?: boolean;
}

/**
 * 모던 순찰 카드
 */
export function PatrolCardEnhanced({
  patrol,
  onPress,
  highlighted = false,
}: PatrolCardEnhancedProps) {
  const [isPressed, setIsPressed] = useState(false);

  // 완료율 계산
  const completionRate =
    patrol.totalCheckpoints > 0
      ? Math.round((patrol.completedCheckpoints / patrol.totalCheckpoints) * 100)
      : 0;

  // 상태별 색상
  const statusGradient = getStatusGradient(patrol.state);

  const handlePress = () => {
    onPress?.(patrol);
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // 경로 프리뷰 생성
  const routePreview = getRoutePreview(patrol);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        highlighted && styles.highlightedContainer,
        { transform: [{ scale: isPressed ? 0.98 : 1 }] },
      ]}
    >
      {/* 하이라이트 글로우 효과 */}
      {highlighted && (
        <LinearGradient
          colors={['rgba(0, 102, 204, 0.15)', 'rgba(0, 163, 255, 0.05)']}
          style={styles.glowBackground}
        />
      )}

      <YStack
        backgroundColor="rgba(255, 255, 255, 0.95)"
        borderRadius="$5"
        padding="$4"
        borderWidth={highlighted ? 2 : 1}
        borderColor={highlighted ? '$primary' : 'rgba(226, 232, 240, 0.8)'}
        overflow="hidden"
      >
        {/* 상단: 건물 아이콘 + 제목 + 상태 배지 */}
        <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
          <XStack gap="$3" flex={1} alignItems="flex-start">
            {/* 건물 아이콘 */}
            <YStack
              width={44}
              height={44}
              borderRadius="$3"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              <LinearGradient
                colors={['#F1F5F9', '#E2E8F0']}
                style={StyleSheet.absoluteFill}
              />
              <Text fontSize={22}>🏢</Text>
            </YStack>

            <YStack flex={1} gap="$1">
              <Text
                fontSize={17}
                fontWeight="700"
                color="$gray900"
                numberOfLines={2}
                letterSpacing={-0.3}
              >
                {patrol.name}
              </Text>
              <XStack gap="$2" alignItems="center">
                <Badge variant="default" size="sm">
                  {patrol.buildingName}
                </Badge>
                {highlighted && (
                  <Badge
                    size="sm"
                    backgroundColor="$primaryMuted"
                    color="$primary"
                    fontWeight="600"
                  >
                    오늘
                  </Badge>
                )}
              </XStack>
            </YStack>
          </XStack>

          {/* 상태 배지 */}
          <YStack overflow="hidden" borderRadius="$full">
            <LinearGradient
              colors={statusGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusBadge}
            >
              <Text fontSize={12} fontWeight="700" color="white">
                {patrol.stateName}
              </Text>
            </LinearGradient>
          </YStack>
        </XStack>

        {/* 구분선 */}
        <YStack
          height={1}
          backgroundColor="$gray200"
          marginBottom="$3"
          opacity={0.6}
        />

        {/* 체크포인트 경로 프리뷰 */}
        {routePreview && (
          <XStack marginBottom="$3" alignItems="center" gap="$2">
            <Text fontSize={13} color="$gray500">
              📍
            </Text>
            <Text
              fontSize={13}
              color="$gray600"
              numberOfLines={1}
              flex={1}
            >
              {routePreview}
            </Text>
          </XStack>
        )}

        {/* 프로그레스 바 */}
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={13} color="$gray500">
              체크포인트 진행률
            </Text>
            <Text fontSize={14} fontWeight="700" color="$primary">
              {patrol.completedCheckpoints}/{patrol.totalCheckpoints}
            </Text>
          </XStack>

          <YStack
            height={8}
            backgroundColor="$gray100"
            borderRadius="$full"
            overflow="hidden"
          >
            <LinearGradient
              colors={statusGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${completionRate}%` }]}
            />
          </YStack>

          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={12} color="$gray400">
              {patrol.completedFloors}/{patrol.floorCount} 층 완료
            </Text>
            <Text
              fontSize={13}
              fontWeight="600"
              color={completionRate === 100 ? '$success' : '$primary'}
            >
              {completionRate}%
            </Text>
          </XStack>
        </YStack>

        {/* 예정 날짜 */}
        <XStack
          marginTop="$3"
          paddingTop="$3"
          borderTopWidth={1}
          borderTopColor="$gray100"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={13} color="$gray500">
            예정 날짜
          </Text>
          <Text fontSize={13} fontWeight="500" color="$gray700">
            {formatDate(patrol.scheduledDate)}
          </Text>
        </XStack>
      </YStack>
    </Pressable>
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
 * 경로 프리뷰 문자열 생성
 */
function getRoutePreview(patrol: PatrolDTO): string | null {
  if (patrol.floorCount <= 0) return null;
  return `${patrol.floorCount}개 층 순찰 경로`;
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  highlightedContainer: {
    shadowColor: '#00A3FF',
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
});

export default PatrolCardEnhanced;
