/**
 * TextField 컴포넌트
 */
import React from 'react';
import { styled, YStack, Text, XStack } from 'tamagui';
import { Input, InputProps } from './Input';

const TextFieldContainer = styled(YStack, {
  name: 'TextFieldContainer',
  gap: 8,
});

export const TextFieldLabel = styled(Text, {
  name: 'TextFieldLabel',
  fontSize: 14,
  fontWeight: '600',
  color: '$gray700',

  variants: {
    error: {
      true: { color: '$error' },
    },
    size: {
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 16 },
      senior: { fontSize: 17 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

export const TextFieldHelper = styled(Text, {
  name: 'TextFieldHelper',
  fontSize: 12,
  color: '$gray500',

  variants: {
    error: {
      true: { color: '$error' },
    },
  } as const,
});

const RequiredMark = styled(Text, {
  color: '$error',
  marginLeft: 4,
});

interface TextFieldProps extends InputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

export function TextField({
  label,
  helperText,
  errorMessage,
  required,
  size = 'md',
  ...inputProps
}: TextFieldProps) {
  const hasError = !!errorMessage;
  const inputSize = size as 'sm' | 'md' | 'lg' | 'senior';

  return (
    <TextFieldContainer>
      {label && (
        <XStack alignItems="center">
          <TextFieldLabel error={hasError} size={inputSize}>
            {label}
          </TextFieldLabel>
          {required && <RequiredMark>*</RequiredMark>}
        </XStack>
      )}

      <Input
        size={inputSize}
        status={hasError ? 'error' : 'default'}
        {...inputProps}
      />

      {(errorMessage || helperText) && (
        <TextFieldHelper error={hasError}>
          {errorMessage || helperText}
        </TextFieldHelper>
      )}
    </TextFieldContainer>
  );
}

export type { TextFieldProps };
export default TextField;
