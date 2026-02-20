/**
 * Video Intro Screen
 *
 * 앱 시작 시 표시되는 3D 스타일 로고 인트로
 * - v1 앱 심볼 (AppSymbol.png) 사용
 * - perspective, rotateY, scale을 활용한 3D 플립 애니메이션
 * - 비디오 사용 시: assets/splash-intro.mp4 추가 후 VideoIntro 주석 해제
 */
import React, { useEffect, useCallback } from 'react';
import { Image, Platform } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { YStack } from 'tamagui';

const INTRO_DURATION_MS = 2800;

interface VideoIntroScreenProps {
  /** 애니메이션 완료 콜백 */
  onComplete: () => void;
}

/**
 * 3D 역동적 로고 애니메이션
 * - Y축 플립 + X축 틸트 + 하단에서 튀어오르는 효과
 * - 바운스 있는 스프링으로 역동적 등장
 */
function Logo3DAnimation({ onComplete }: { onComplete: () => void }) {
  const scale = useSharedValue(0.2);
  const rotateY = useSharedValue(-100);
  const rotateX = useSharedValue(25);
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withDelay(1800, withTiming(0, { duration: 500 }))
    );
  }, [opacity]);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.25, { damping: 8, stiffness: 120 }), // 강한 바운스
      withDelay(800, withSpring(1, { damping: 14, stiffness: 150 })) // 탄력 있게 정착
    );
  }, [scale]);

  useEffect(() => {
    rotateY.value = withSpring(0, { damping: 12, stiffness: 90 });
  }, [rotateY]);

  useEffect(() => {
    rotateX.value = withSequence(
      withSpring(0, { damping: 14, stiffness: 100 }),
      withDelay(200, withSpring(-3, { damping: 20, stiffness: 200 })) // 미세한 반동
    );
  }, [rotateX]);

  useEffect(() => {
    translateY.value = withSequence(
      withSpring(0, { damping: 10, stiffness: 100 }), // 아래에서 튀어오름
      withDelay(300, withSpring(-8, { damping: 18, stiffness: 200 })) // 살짝 위로 튐
    );
  }, [translateY]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runOnJS(handleComplete)();
    }, INTRO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [handleComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    const perspective = Platform.OS === 'ios' ? 1000 : 700;
    return {
      opacity: opacity.value,
      transform: [
        { perspective },
        { translateY: translateY.value },
        { rotateY: `${rotateY.value}deg` },
        { rotateX: `${rotateX.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <Image
        source={require('../../assets/AppSymbol.png')}
        style={{ width: 180, height: 180 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

/**
 * 앱 시작 인트로 화면
 *
 * v1 로고를 3D 애니메이션으로 표시
 * 비디오 사용 시: expo-video의 useVideoPlayer, VideoView로 교체 가능
 */
export function VideoIntroScreen({ onComplete }: VideoIntroScreenProps) {
  return (
    <YStack flex={1} backgroundColor="#0064FF" alignItems="center" justifyContent="center">
      <Logo3DAnimation onComplete={onComplete} />
    </YStack>
  );
}
