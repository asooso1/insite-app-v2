/**
 * Button 컴포넌트
 *
 * 2026 Modern UI - 그라디언트 + 애니메이션 버튼
 * 터치 피드백과 글로우 효과로 프리미엄 느낌
 */
import React, { useCallback } from 'react';
import { Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import { styled, Text, XStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { gradients } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * 버튼 텍스트 스타일
 */
const ButtonText = styled(Text, {
  name: 'ButtonText',
  fontWeight: '600',
  textAlign: 'center',
  letterSpacing: 0.3,

  variants: {
    variant: {
      primary: { color: '$colorInverse' },
      secondary: { color: '$colorInverse' },
      accent: { color: '$colorInverse' },
      outline: { color: '$primary' },
      ghost: { color: '$primary' },
      danger: { color: '$colorInverse' },
      success: { color: '$colorInverse' },
      subtle: { color: '$color' },
    },
    size: {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
      xl: { fontSize: 20 },
      senior: { fontSize: 19 },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

/**
 * 버튼 아이콘 래퍼
 */
const IconWrapper = styled(XStack, {
  name: 'IconWrapper',
  alignItems: 'center',
  justifyContent: 'center',
});

/**
 * Button Props
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'senior';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rounded?: boolean;
  glow?: boolean;
  testID?: string;
}

/**
 * 버튼 높이 매핑
 */
const sizeToHeight: Record<string, number> = {
  sm: 40,
  md: 48,
  lg: 56,
  xl: 64,
  senior: 56,
};

/**
 * 버튼 패딩 매핑
 */
const sizeToPadding: Record<string, number> = {
  sm: 14,
  md: 20,
  lg: 24,
  xl: 28,
  senior: 24,
};

/**
 * 버튼 라운딩 매핑
 */
const sizeToRadius: Record<string, number> = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  senior: 14,
};

/**
 * 그라디언트 색상 매핑
 */
const variantToGradient: Record<string, readonly [string, string]> = {
  primary: gradients.primary,
  secondary: ['#FF6B00', '#FF8533'] as const,
  accent: gradients.accent,
  danger: gradients.error,
  success: gradients.success,
};

/**
 * 솔리드 배경색 매핑 (outline, ghost, subtle)
 */
const variantToSolidStyle: Record<
  string,
  {
    backgroundColor: string;
    borderColor?: string;
    borderWidth?: number;
  }
> = {
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#0066CC',
    borderWidth: 2,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  subtle: {
    backgroundColor: '#F1F5F9',
  },
};

/**
 * Button 컴포넌트
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
  icon,
  iconPosition = 'left',
  rounded = false,
  glow = false,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // 애니메이션 값
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // 프레스 핸들러
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(0.9, { duration: 100 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(1, { duration: 150 });
  }, [scale, opacity]);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // 스타일 계산
  const buttonHeight = sizeToHeight[size] ?? 48;
  const paddingHorizontal = sizeToPadding[size] ?? 20;
  const borderRadius = rounded ? buttonHeight / 2 : (sizeToRadius[size] ?? 12);

  const isGradient = ['primary', 'secondary', 'accent', 'danger', 'success'].includes(variant);
  const gradientColors = variantToGradient[variant];
  const solidStyle = variantToSolidStyle[variant];

  // 컨테이너 스타일
  const containerStyle: ViewStyle = {
    height: buttonHeight,
    paddingHorizontal,
    borderRadius,
    width: fullWidth ? '100%' : undefined,
    alignSelf: fullWidth ? 'stretch' : 'center',
    overflow: 'hidden',
    ...(solidStyle && {
      backgroundColor: solidStyle.backgroundColor,
      borderColor: solidStyle.borderColor,
      borderWidth: solidStyle.borderWidth,
    }),
    // 글로우 효과
    ...(glow &&
      !isDisabled && {
        shadowColor: '#00A3FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      }),
    // 비활성화 스타일
    ...(isDisabled && {
      opacity: 0.5,
    }),
  };

  // 그라디언트 스타일
  const gradientStyle: ViewStyle = {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  };

  // 솔리드 콘텐츠 스타일
  const contentStyle: ViewStyle = {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  };

  // 로딩 인디케이터 색상
  const loadingColor =
    variant === 'outline' || variant === 'ghost' || variant === 'subtle'
      ? '#0066CC'
      : '#FFFFFF';

  // 콘텐츠 렌더링
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={loadingColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <IconWrapper>{icon}</IconWrapper>}
          <ButtonText variant={variant} size={size}>
            {children}
          </ButtonText>
          {icon && iconPosition === 'right' && <IconWrapper>{icon}</IconWrapper>}
        </>
      )}
    </>
  );

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[containerStyle, animatedStyle]}
    >
      {isGradient && gradientColors ? (
        <LinearGradient
          colors={isDisabled ? ['#94A3B8', '#CBD5E1'] : [gradientColors[0], gradientColors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={gradientStyle}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <XStack style={contentStyle}>{renderContent()}</XStack>
      )}
    </AnimatedPressable>
  );
}

/**
 * Icon Button - 아이콘만 있는 버튼
 */
interface IconButtonProps {
  icon: React.ReactNode;
  variant?: ButtonProps['variant'];
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  glow?: boolean;
  testID?: string;
}

const iconSizeToSize: Record<string, number> = {
  sm: 36,
  md: 44,
  lg: 52,
};

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  glow = false,
  testID,
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  const dimension = iconSizeToSize[size] ?? 44;

  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isGradient = ['primary', 'secondary', 'accent', 'danger', 'success'].includes(variant);
  const gradientColors = variantToGradient[variant];
  const solidStyle = variantToSolidStyle[variant];

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...(solidStyle && {
      backgroundColor: solidStyle.backgroundColor,
      borderColor: solidStyle.borderColor,
      borderWidth: solidStyle.borderWidth,
    }),
    ...(glow &&
      !isDisabled && {
        shadowColor: '#00A3FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
      }),
    ...(isDisabled && { opacity: 0.5 }),
  };

  const loadingColor =
    variant === 'outline' || variant === 'ghost' || variant === 'subtle'
      ? '#0066CC'
      : '#FFFFFF';

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[containerStyle, animatedStyle]}
    >
      {isGradient && gradientColors ? (
        <LinearGradient
          colors={isDisabled ? ['#94A3B8', '#CBD5E1'] : [gradientColors[0], gradientColors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loading ? <ActivityIndicator size="small" color={loadingColor} /> : icon}
        </LinearGradient>
      ) : loading ? (
        <ActivityIndicator size="small" color={loadingColor} />
      ) : (
        icon
      )}
    </AnimatedPressable>
  );
}

export type { ButtonProps, IconButtonProps };

export default Button;
