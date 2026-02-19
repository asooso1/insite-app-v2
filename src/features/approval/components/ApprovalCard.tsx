/**
 * 승인/확인 카드 컴포넌트
 *
 * 2026 Modern UI - Floating Card 스타일
 */
import React from 'react';
import { StyleSheet, Platform, ViewStyle, Pressable } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { ApprovalItemDTO } from '../types';

interface ApprovalCardProps {
  item: ApprovalItemDTO;
  onPress?: (item: ApprovalItemDTO) => void;
  /** 선택 모드 여부 */
  selectionMode?: boolean;
  /** 선택 여부 */
  selected?: boolean;
  /** 선택 토글 */
  onToggleSelect?: (item: ApprovalItemDTO) => void;
}

/**
 * 타입별 그라디언트 색상
 */
const TYPE_GRADIENTS = {
  WORK: ['#0066CC', '#00A3FF'] as [string, string],
  PATROL: ['#00A043', '#00C853'] as [string, string],
  EMERGENCY: ['#DC2626', '#EF4444'] as [string, string],
  REGULAR: ['#9333EA', '#C084FC'] as [string, string],
  ADHOC: ['#FF6B00', '#FFB800'] as [string, string],
  DAILY: ['#64748B', '#94A3B8'] as [string, string],
} as const;

/**
 * 상태별 배지 색상
 */
const STATUS_COLORS = {
  PENDING: { bg: '#FFF3E6', color: '#FF6B00' },
  APPROVED: { bg: '#E6FFF0', color: '#00A043' },
  REJECTED: { bg: '#FFE6E6', color: '#DC2626' },
} as const;

const STATUS_NAMES = {
  PENDING: '미확인',
  APPROVED: '확인완료',
  REJECTED: '반려',
};

/**
 * 우선순위 배지 색상
 */
const PRIORITY_COLORS = {
  HIGH: { bg: '#FFE6E6', color: '#DC2626' },
  MEDIUM: { bg: '#FFF3E6', color: '#FF6B00' },
  LOW: { bg: '#E6F2FF', color: '#0066CC' },
} as const;

const PRIORITY_NAMES = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

/**
 * 승인/확인 카드 컴포넌트
 */
export function ApprovalCard({
  item,
  onPress,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: ApprovalCardProps) {
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
    if (selectionMode && onToggleSelect) {
      onToggleSelect(item);
    } else {
      onPress?.(item);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const typeGradient = TYPE_GRADIENTS[item.type] || TYPE_GRADIENTS.WORK;
  const statusColor = STATUS_COLORS[item.status];
  const priorityColor = item.priority ? PRIORITY_COLORS[item.priority] : null;

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
              colors={typeGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </YStack>

          <YStack padding="$4" paddingLeft="$5">
            {/* 헤더: 타입 배지 + 날짜 + 선택 체크박스 */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <XStack gap="$2" alignItems="center" flex={1}>
                {/* 타입 배지 */}
                <XStack borderRadius={8} overflow="hidden">
                  <LinearGradient
                    colors={typeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingHorizontal: 10, paddingVertical: 5 }}
                  >
                    <Text fontSize={12} fontWeight="700" color="$white">
                      {item.typeName}
                    </Text>
                  </LinearGradient>
                </XStack>

                {/* 우선순위 배지 */}
                {priorityColor && (
                  <XStack
                    backgroundColor={priorityColor.bg}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius={6}
                  >
                    <Text fontSize={11} fontWeight="600" color={priorityColor.color}>
                      {PRIORITY_NAMES[item.priority!]}
                    </Text>
                  </XStack>
                )}
              </XStack>

              <XStack gap="$2" alignItems="center">
                {/* 날짜 */}
                <Text fontSize={12} color="$gray400" fontWeight="500">
                  {item.completedDate || item.createdDate}
                </Text>

                {/* 선택 체크박스 */}
                {selectionMode && (
                  <XStack
                    width={24}
                    height={24}
                    borderRadius={12}
                    borderWidth={2}
                    borderColor={selected ? '$primary' : '$gray300'}
                    backgroundColor={selected ? '$primary' : 'transparent'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {selected && (
                      <Text fontSize={14} color="$white" fontWeight="700">
                        ✓
                      </Text>
                    )}
                  </XStack>
                )}
              </XStack>
            </XStack>

            {/* 제목 */}
            <Text
              fontSize={17}
              fontWeight="700"
              color="$gray900"
              numberOfLines={2}
              marginBottom="$2"
              letterSpacing={-0.3}
            >
              {item.title}
            </Text>

            {/* 건물명 + 작성자 */}
            <XStack gap="$2" alignItems="center" marginBottom="$3">
              <Text fontSize={13} color="$gray500">
                {item.buildingName}
              </Text>
              {item.writerName && (
                <>
                  <Text fontSize={13} color="$gray300">
                    |
                  </Text>
                  <Text fontSize={13} color="$gray500">
                    {item.writerName}
                  </Text>
                </>
              )}
            </XStack>

            {/* 구분선 */}
            <YStack height={1} backgroundColor="$gray100" marginBottom="$3" />

            {/* 하단: 상태 + 첨부파일 + 진행률 */}
            <XStack justifyContent="space-between" alignItems="center">
              {/* 상태 배지 */}
              <XStack
                backgroundColor={statusColor.bg}
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius={8}
              >
                <Text fontSize={12} fontWeight="600" color={statusColor.color}>
                  {STATUS_NAMES[item.status]}
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                {/* 첨부파일 */}
                {item.attachmentCount !== undefined && item.attachmentCount > 0 && (
                  <XStack gap="$1" alignItems="center">
                    <Text fontSize={12} color="$gray400">
                      📎
                    </Text>
                    <Text fontSize={12} color="$gray600" fontWeight="600">
                      {item.attachmentCount}
                    </Text>
                  </XStack>
                )}

                {/* 진행률 */}
                {item.progress !== undefined && (
                  <XStack
                    backgroundColor="rgba(0, 102, 204, 0.08)"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius={6}
                  >
                    <Text fontSize={12} fontWeight="600" color="$primary">
                      {item.progress}%
                    </Text>
                  </XStack>
                )}
              </XStack>
            </XStack>
          </YStack>
        </YStack>
      </Animated.View>
    </Pressable>
  );
}

export default ApprovalCard;
