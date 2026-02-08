/**
 * Switch 컴포넌트
 */
import React from 'react';
import { styled, XStack, Text, YStack } from 'tamagui';
import { Pressable } from 'react-native';

const SwitchTrack = styled(YStack, {
  name: 'SwitchTrack',
  borderRadius: 9999,
  justifyContent: 'center',

  variants: {
    checked: {
      true: { backgroundColor: '$primary' },
      false: { backgroundColor: '$gray300' },
    },
    disabled: {
      true: { opacity: 0.5 },
    },
    size: {
      sm: { width: 36, height: 20, padding: 2 },
      md: { width: 44, height: 24, padding: 2 },
      lg: { width: 52, height: 28, padding: 3 },
      senior: { width: 58, height: 32, padding: 3 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    checked: false,
  },
});

const SwitchThumb = styled(YStack, {
  name: 'SwitchThumb',
  backgroundColor: '$white',
  borderRadius: 9999,

  variants: {
    size: {
      sm: { width: 16, height: 16 },
      md: { width: 20, height: 20 },
      lg: { width: 22, height: 22 },
      senior: { width: 26, height: 26 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

const SwitchLabel = styled(Text, {
  name: 'SwitchLabel',
  color: '$gray700',
  marginLeft: 12,

  variants: {
    disabled: {
      true: { color: '$gray400' },
    },
    size: {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
      senior: { fontSize: 19 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'senior';
}

const getThumbOffset = (size: string, checked: boolean) => {
  const offsets: Record<string, { on: number; off: number }> = {
    sm: { on: 16, off: 0 },
    md: { on: 20, off: 0 },
    lg: { on: 24, off: 0 },
    senior: { on: 26, off: 0 },
  };
  return checked ? offsets[size]?.on || 20 : offsets[size]?.off || 0;
};

export function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
}: SwitchProps) {
  const handlePress = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <XStack alignItems="center">
        <SwitchTrack checked={checked} disabled={disabled} size={size}>
          <SwitchThumb
            size={size}
            x={getThumbOffset(size, checked)}
          />
        </SwitchTrack>
        {label && (
          <SwitchLabel disabled={disabled} size={size}>
            {label}
          </SwitchLabel>
        )}
      </XStack>
    </Pressable>
  );
}

export type { SwitchProps };
export default Switch;
