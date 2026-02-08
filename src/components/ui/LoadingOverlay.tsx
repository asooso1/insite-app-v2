/**
 * LoadingOverlay 컴포넌트
 */
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { styled, YStack, Text, XStack } from 'tamagui';

const Overlay = styled(YStack, {
  name: 'LoadingOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,

  variants: {
    transparent: {
      true: { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
      false: { backgroundColor: '$white' },
    },
    dark: {
      true: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    },
  } as const,

  defaultVariants: {
    transparent: true,
  },
});

const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  alignItems: 'center',
  gap: 12,
});

const LoadingText = styled(Text, {
  name: 'LoadingText',
  fontSize: 14,
  color: '$gray600',
  marginTop: 8,
});

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  dark?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingOverlay({
  visible,
  message,
  transparent = true,
  dark = false,
  size = 'large',
  color,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Overlay transparent={transparent} dark={dark}>
      <LoadingContainer>
        <ActivityIndicator
          size={size}
          color={color || (dark ? '#FFFFFF' : '#0066CC')}
        />
        {message && (
          <LoadingText color={dark ? '$white' : '$gray600'}>
            {message}
          </LoadingText>
        )}
      </LoadingContainer>
    </Overlay>
  );
}

const InlineContainer = styled(XStack, {
  name: 'LoadingSpinner',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: 16,
});

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  message,
  size = 'small',
  color = '#0066CC',
}: LoadingSpinnerProps) {
  return (
    <InlineContainer>
      <ActivityIndicator size={size} color={color} />
      {message && <Text color="$gray600" fontSize={14}>{message}</Text>}
    </InlineContainer>
  );
}

export type { LoadingOverlayProps, LoadingSpinnerProps };
export default LoadingOverlay;
