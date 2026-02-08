/**
 * Button 컴포넌트
 *
 * Tamagui 기반 버튼 컴포넌트
 */
import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { styled, Text, XStack } from 'tamagui';

/**
 * 버튼 컨테이너
 */
const ButtonContainer = styled(XStack, {
  name: 'Button',
  borderRadius: 8,
  paddingHorizontal: 16,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
      },
      secondary: {
        backgroundColor: '$secondary',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$primary',
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: '$error',
      },
      success: {
        backgroundColor: '$success',
      },
    },
    size: {
      sm: {
        height: 36,
        paddingHorizontal: 12,
      },
      md: {
        height: 44,
        paddingHorizontal: 16,
      },
      lg: {
        height: 52,
        paddingHorizontal: 20,
      },
      senior: {
        height: 53,
        paddingHorizontal: 20,
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

/**
 * 버튼 텍스트
 */
const ButtonText = styled(Text, {
  name: 'ButtonText',
  fontWeight: '600',
  textAlign: 'center',

  variants: {
    variant: {
      primary: { color: '$white' },
      secondary: { color: '$white' },
      outline: { color: '$primary' },
      ghost: { color: '$primary' },
      danger: { color: '$white' },
      success: { color: '$white' },
    },
    size: {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
      senior: { fontSize: 19 },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

/**
 * Button Props
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'senior';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  iconOnly?: boolean;
}

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
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <ButtonContainer
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={isDisabled}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? '#0066CC' : '#FFFFFF'}
          />
        ) : (
          <ButtonText variant={variant} size={size}>
            {children}
          </ButtonText>
        )}
      </ButtonContainer>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export type { ButtonProps };

export default Button;
