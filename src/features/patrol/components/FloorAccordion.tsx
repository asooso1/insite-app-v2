/**
 * FloorAccordion 컴포넌트
 *
 * 2026 Modern UI - 층별 아코디언 섹션
 * 부드러운 펼침 애니메이션과 그라디언트 프로그레스
 */
import React, { useState, useCallback } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { CheckpointItem } from './CheckpointItem';
import type { FloorDTO, CheckpointDTO } from '../types/patrol.types';

// Android에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FloorAccordionProps {
  floor: FloorDTO;
  onCheckpointPress?: (checkpoint: CheckpointDTO) => void;
  /** 기본 펼침 여부 */
  defaultExpanded?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * 층별 아코디언 섹션
 */
export function FloorAccordion({
  floor,
  onCheckpointPress,
  defaultExpanded = false,
}: FloorAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 1 : 0);
  const scale = useSharedValue(1);

  // 총 체크포인트 수와 완료된 체크포인트 수 계산
  const totalCheckpoints = floor.zones.reduce((sum, zone) => sum + zone.checkpoints.length, 0);
  const completedCheckpoints = floor.zones.reduce(
    (sum, zone) => sum + zone.checkpoints.filter((cp) => cp.status === 'COMPLETED').length,
    0
  );

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    rotation.value = withSpring(expanded ? 0 : 1, { damping: 15 });
  }, [expanded, rotation]);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const arrowStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotation.value, [0, 1], [0, 90], Extrapolation.CLAMP);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // 상태에 따른 그라디언트
  const progressGradient =
    floor.completionRate === 100
      ? (['#00C853', '#69F0AE'] as const)
      : floor.completionRate > 0
        ? (['#FF8F00', '#FFB300'] as const)
        : (['#94A3B8', '#CBD5E1'] as const);

  return (
    <YStack marginBottom="$2">
      {/* 층 헤더 */}
      <AnimatedPressable
        onPress={handleToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          {
            marginHorizontal: 16,
            borderRadius: 16,
            shadowColor: '#0066CC',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          },
          headerStyle,
        ]}
      >
        <YStack
          backgroundColor={expanded ? '$gray50' : '$white'}
          borderRadius="$4"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderWidth={1}
          borderColor={expanded ? '$gray200' : '$gray100'}
        >
          <XStack justifyContent="space-between" alignItems="center">
            {/* 왼쪽: 화살표 + 층명 */}
            <XStack gap="$3" alignItems="center" flex={1}>
              <Animated.View style={arrowStyle}>
                <YStack
                  width={28}
                  height={28}
                  borderRadius="$2"
                  backgroundColor="$gray100"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={14} color="$gray600" fontWeight="600">
                    ›
                  </Text>
                </YStack>
              </Animated.View>

              <YStack flex={1} gap="$0.5">
                <Text fontSize={16} fontWeight="700" color="$gray900">
                  {floor.buildingFloorName}
                </Text>
                <Text fontSize={13} color="$gray500">
                  {completedCheckpoints}/{totalCheckpoints} 체크포인트
                </Text>
              </YStack>
            </XStack>

            {/* 오른쪽: 프로그레스 바 + 퍼센트 */}
            <XStack alignItems="center" gap="$3">
              <YStack width={60} height={6} borderRadius="$full" overflow="hidden">
                <YStack flex={1} backgroundColor="$gray200" borderRadius="$full" overflow="hidden">
                  <LinearGradient
                    colors={progressGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: '100%', borderRadius: 999, width: `${floor.completionRate}%` }}
                  />
                </YStack>
              </YStack>

              <Text
                fontSize={14}
                fontWeight="700"
                color={
                  floor.completionRate === 100
                    ? '$success'
                    : floor.completionRate > 0
                      ? '$warning'
                      : '$gray500'
                }
                width={45}
                textAlign="right"
              >
                {floor.completionRate}%
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </AnimatedPressable>

      {/* 체크포인트 목록 */}
      {expanded && (
        <YStack paddingTop="$2" paddingBottom="$1">
          {floor.zones.map((zone) => (
            <YStack key={zone.buildingFloorZoneId}>
              {/* 구역 헤더 */}
              <XStack
                paddingHorizontal="$5"
                paddingVertical="$2"
                marginLeft="$4"
                alignItems="center"
                gap="$2"
              >
                <YStack
                  width={6}
                  height={6}
                  borderRadius="$full"
                  backgroundColor="$primary"
                  opacity={0.6}
                />
                <Text fontSize={13} fontWeight="600" color="$gray700">
                  {zone.buildingFloorZoneName}
                </Text>
                <Text fontSize={12} color="$gray400">
                  ({zone.checkpoints.length}개)
                </Text>
              </XStack>

              {/* 체크포인트 아이템 */}
              {zone.checkpoints.map((checkpoint, idx) => (
                <CheckpointItem
                  key={checkpoint.id}
                  checkpoint={checkpoint}
                  onPress={onCheckpointPress}
                  isFirst={idx === 0}
                  isLast={idx === zone.checkpoints.length - 1}
                />
              ))}
            </YStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

export default FloorAccordion;
