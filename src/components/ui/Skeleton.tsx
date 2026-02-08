/**
 * Skeleton 컴포넌트
 */
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { styled, YStack, XStack } from 'tamagui';

const SkeletonBase = styled(YStack, {
  name: 'Skeleton',
  backgroundColor: '$gray200',
  overflow: 'hidden',
});

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
  variant = 'text',
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const getRadius = () => {
    if (borderRadius !== undefined) return borderRadius;
    switch (variant) {
      case 'circular':
        return 9999;
      case 'rectangular':
        return 8;
      default:
        return 4;
    }
  };

  return (
    <Animated.View style={{ opacity }}>
      <SkeletonBase
        width={width as number}
        height={height}
        borderRadius={getRadius()}
      />
    </Animated.View>
  );
}

export function SkeletonText({ lines = 3, spacing = 8 }: { lines?: number; spacing?: number }) {
  return (
    <YStack gap={spacing}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </YStack>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} borderRadius={9999} />;
}

export function SkeletonCard() {
  return (
    <YStack
      backgroundColor="$white"
      borderRadius={12}
      padding={16}
      gap={12}
      borderWidth={1}
      borderColor="$gray200"
    >
      <XStack alignItems="center" gap={12}>
        <SkeletonAvatar />
        <YStack flex={1} gap={8}>
          <Skeleton height={14} width="50%" />
          <Skeleton height={12} width="30%" />
        </YStack>
      </XStack>
      <SkeletonText lines={2} />
    </YStack>
  );
}

export type { SkeletonProps };
export default Skeleton;
