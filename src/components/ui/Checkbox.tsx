/**
 * Checkbox 컴포넌트
 */
import React from 'react';
import { styled, XStack, Text, YStack } from 'tamagui';
import { Pressable } from 'react-native';

const CheckboxBox = styled(YStack, {
  name: 'CheckboxBox',
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 2,
  borderColor: '$gray400',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$white',

  variants: {
    checked: {
      true: {
        backgroundColor: '$primary',
        borderColor: '$primary',
      },
    },
    disabled: {
      true: {
        backgroundColor: '$gray100',
        borderColor: '$gray300',
      },
    },
    size: {
      sm: { width: 16, height: 16 },
      md: { width: 20, height: 20 },
      lg: { width: 24, height: 24 },
      senior: { width: 28, height: 28 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

const CheckMark = styled(Text, {
  name: 'CheckMark',
  color: '$white',
  fontWeight: 'bold',

  variants: {
    size: {
      sm: { fontSize: 10 },
      md: { fontSize: 12 },
      lg: { fontSize: 14 },
      senior: { fontSize: 18 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

const CheckboxLabel = styled(Text, {
  name: 'CheckboxLabel',
  color: '$gray700',
  marginLeft: 8,

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

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'senior';
}

export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <XStack alignItems="center">
        <CheckboxBox checked={checked} disabled={disabled} size={size}>
          {checked && <CheckMark size={size}>✓</CheckMark>}
        </CheckboxBox>
        {label && (
          <CheckboxLabel disabled={disabled} size={size}>
            {label}
          </CheckboxLabel>
        )}
      </XStack>
    </Pressable>
  );
}

export type { CheckboxProps };
export default Checkbox;
