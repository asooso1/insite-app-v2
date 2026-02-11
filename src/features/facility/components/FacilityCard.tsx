/**
 * 설비 카드 컴포넌트
 *
 * 2026 Modern UI - Floating Card 스타일
 * 설비 상태별 그라디언트 인디케이터, 이미지 썸네일
 */
import React from 'react';
import { StyleSheet, Platform, ViewStyle, Pressable, Image } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { FacilityDTO } from '../types';

interface FacilityCardProps {
  facility: FacilityDTO;
  onPress?: (facility: FacilityDTO) => void;
  compact?: boolean;
}

/**
 * 상태별 그라디언트 색상
 */
const STATUS_GRADIENTS = {
  NORMAL: ['#00A043', '#00C853'] as [string, string], // 정상 - 그린
  WARNING: ['#FF6B00', '#FFB800'] as [string, string], // 주의 - 오렌지
  ERROR: ['#DC2626', '#EF4444'] as [string, string], // 오류 - 레드
  MAINTENANCE: ['#0066CC', '#00A3FF'] as [string, string], // 점검중 - 블루
} as const;

type StatusGradientKey = keyof typeof STATUS_GRADIENTS;

function getStatusGradient(status: string | undefined): [string, string] {
  if (status && status in STATUS_GRADIENTS) {
    return STATUS_GRADIENTS[status as StatusGradientKey];
  }
  return STATUS_GRADIENTS.NORMAL;
}

/**
 * 상태별 배경색 (연한 버전)
 */
const STATUS_BG_COLORS: Record<string, string> = {
  NORMAL: 'rgba(0, 160, 67, 0.08)',
  WARNING: 'rgba(255, 107, 0, 0.08)',
  ERROR: 'rgba(220, 38, 38, 0.08)',
  MAINTENANCE: 'rgba(0, 102, 204, 0.08)',
};

/**
 * 상태 한글명 매핑
 */
const STATUS_NAMES: Record<string, string> = {
  NORMAL: '정상',
  WARNING: '주의',
  ERROR: '오류',
  MAINTENANCE: '점검중',
};

/**
 * 2026 Modern 설비 카드
 */
export function FacilityCard({ facility, onPress, compact = false }: FacilityCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1);
  };

  const handlePress = () => {
    onPress?.(facility);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const statusGradient = getStatusGradient(facility.status);
  const statusBg = STATUS_BG_COLORS[facility.status || 'NORMAL'] || STATUS_BG_COLORS.NORMAL;
  const statusName = STATUS_NAMES[facility.status || 'NORMAL'];

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <YStack
          marginHorizontal="$4"
          marginVertical="$2"
          backgroundColor="$surface"
          borderRadius={20}
          overflow="hidden"
          style={
            Platform.select({
              ios: {
                shadowColor: '#0066CC',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
              },
              android: {
                elevation: 6,
              },
            }) as ViewStyle
          }
        >
          {/* 그라디언트 상태 인디케이터 (좌측 보더) */}
          <YStack position="absolute" left={0} top={0} bottom={0} width={4} overflow="hidden">
            <LinearGradient
              colors={statusGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </YStack>

          <XStack>
            {/* 썸네일 이미지 */}
            {!compact && facility.imageUrl && (
              <YStack width={100} height={120}>
                <Image
                  source={{ uri: facility.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </YStack>
            )}

            {/* 콘텐츠 */}
            <YStack flex={1} padding="$4" paddingLeft={compact ? '$5' : '$4'}>
              {/* 헤더: 상태 배지 + 코드 */}
              <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                {/* 상태 배지 (그라디언트) */}
                <XStack borderRadius={8} overflow="hidden">
                  <LinearGradient
                    colors={statusGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statusBadge}
                  >
                    <Text fontSize={12} fontWeight="700" color="$white">
                      {statusName}
                    </Text>
                  </LinearGradient>
                </XStack>

                {/* 설비 코드 */}
                {facility.code && (
                  <Text fontSize={11} color="$gray400" fontWeight="500">
                    {facility.code}
                  </Text>
                )}
              </XStack>

              {/* 설비명 */}
              <Text
                fontSize={17}
                fontWeight="700"
                color="$gray900"
                numberOfLines={2}
                marginBottom="$2"
                letterSpacing={-0.3}
              >
                {facility.name}
              </Text>

              {/* 위치 + 분류 */}
              <XStack gap="$2" alignItems="center" marginBottom="$3">
                <Text fontSize={13} color="$gray500">
                  {facility.buildingName}
                </Text>
                {facility.floor && (
                  <>
                    <Text fontSize={13} color="$gray300">
                      |
                    </Text>
                    <Text fontSize={13} color="$gray500">
                      {facility.floor}
                    </Text>
                  </>
                )}
              </XStack>

              {!compact && (
                <>
                  {/* 구분선 */}
                  <YStack height={1} backgroundColor="$gray100" marginBottom="$3" />

                  {/* 제조사 + 작업 수 */}
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$1" alignItems="center">
                      <Text fontSize={13} color="$gray400">
                        제조사:
                      </Text>
                      <Text fontSize={13} fontWeight="600" color="$gray700">
                        {facility.manufacturer || '-'}
                      </Text>
                    </XStack>

                    {facility.workOrderCount !== undefined && facility.workOrderCount > 0 && (
                      <XStack
                        backgroundColor={
                          statusBg as `rgba(${number}, ${number}, ${number}, ${number})`
                        }
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius={6}
                      >
                        <Text fontSize={12} fontWeight="600" color="$primary">
                          작업 {facility.workOrderCount}건
                        </Text>
                      </XStack>
                    )}
                  </XStack>
                </>
              )}
            </YStack>
          </XStack>
        </YStack>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default FacilityCard;
