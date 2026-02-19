/**
 * GlassCard 컴포넌트
 *
 * 2026 Modern UI - Glassmorphism 스타일 카드
 * 반투명 배경, 블러 효과, 미묘한 보더로 깊이감 표현
 */
import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { YStack, GetProps } from 'tamagui';
import { shadows } from '@/theme/tokens';

interface GlassCardProps {
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 패딩 (기본: 20) */
  padding?: number;
  /** 마진 */
  margin?: number;
  /** 마진 수평 */
  marginHorizontal?: number;
  /** 마진 수직 */
  marginVertical?: number;
  /** 마진 상단 */
  marginTop?: number;
  /** 마진 하단 */
  marginBottom?: number;
  /** 투명도 강도 */
  intensity?: 'light' | 'medium' | 'heavy';
  /** 플로팅 효과 */
  floating?: boolean;
  /** 글로우 효과 */
  glow?: boolean;
  /** 강조 보더 색상 */
  accentColor?: string;
  /** 전체 너비 */
  fullWidth?: boolean;
  /** 스타일 오버라이드 */
  style?: ViewStyle;
  /** 프레스 이벤트 */
  onPress?: () => void;
}

/**
 * Glassmorphism 스타일 카드
 *
 * @example
 * ```tsx
 * <GlassCard floating intensity="medium">
 *   <Text>콘텐츠</Text>
 * </GlassCard>
 * ```
 */
export function GlassCard({
  children,
  padding = 20,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  intensity = 'medium',
  floating = false,
  glow = false,
  accentColor,
  fullWidth = false,
  style,
  onPress,
}: GlassCardProps) {
  const getBackgroundColor = () => {
    switch (intensity) {
      case 'light':
        return 'rgba(255, 255, 255, 0.6)';
      case 'heavy':
        return 'rgba(255, 255, 255, 0.9)';
      case 'medium':
      default:
        return 'rgba(255, 255, 255, 0.75)';
    }
  };

  const getBorderColor = () => {
    if (accentColor) return accentColor;
    switch (intensity) {
      case 'light':
        return 'rgba(255, 255, 255, 0.3)';
      case 'heavy':
        return 'rgba(255, 255, 255, 0.5)';
      case 'medium':
      default:
        return 'rgba(255, 255, 255, 0.4)';
    }
  };

  const getShadowStyle = (): ViewStyle => {
    if (glow) return shadows.glow as ViewStyle;
    if (floating) return shadows.floating as ViewStyle;
    return shadows.md as ViewStyle;
  };

  return (
    <YStack
      backgroundColor={getBackgroundColor() as `rgba(${number}, ${number}, ${number}, ${number})`}
      borderRadius={20}
      // radius.$5 (20px) - tokens.ts
      borderWidth={1}
      borderColor={getBorderColor() as `rgba(${number}, ${number}, ${number}, ${number})`}
      padding={padding}
      margin={margin}
      marginHorizontal={marginHorizontal}
      marginVertical={marginVertical}
      marginTop={marginTop}
      marginBottom={marginBottom}
      width={fullWidth ? '100%' : undefined}
      overflow="hidden"
      pressStyle={onPress ? { opacity: 0.95, scale: 0.98 } : undefined}
      onPress={onPress}
      style={
        [
          Platform.select({
            ios: getShadowStyle(),
            android: {
              elevation: floating ? 12 : glow ? 10 : 4,
            },
          }),
          style,
        ] as ViewStyle[]
      }
    >
      {children}
    </YStack>
  );
}

export type GlassCardExportProps = GetProps<typeof YStack> & GlassCardProps;

export default GlassCard;
