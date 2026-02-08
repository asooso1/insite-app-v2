/**
 * TextField 컴포넌트
 *
 * 2026 Modern UI - 완성된 입력 필드 컴포넌트
 * 라벨, 아이콘, 에러 메시지를 포함한 통합 컴포넌트
 */
import React, { useState } from 'react';
import { styled, YStack, XStack, Text, View } from 'tamagui';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { Input, InputProps } from './Input';

/**
 * 텍스트 필드 컨테이너
 */
const TextFieldContainer = styled(YStack, {
  name: 'TextFieldContainer',
  gap: 6,
  position: 'relative',
});

/**
 * 라벨 스타일
 */
export const TextFieldLabel = styled(Text, {
  name: 'TextFieldLabel',
  fontSize: 14,
  fontWeight: '600',
  color: '$colorSecondary',
  marginBottom: 2,

  variants: {
    error: {
      true: { color: '$error' },
    },
    focused: {
      true: { color: '$primary' },
    },
    size: {
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 15 },
      senior: { fontSize: 16, fontWeight: '700' },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

/**
 * 헬퍼 텍스트 스타일
 */
export const TextFieldHelper = styled(Text, {
  name: 'TextFieldHelper',
  fontSize: 12,
  color: '$colorMuted',
  marginTop: 2,
  lineHeight: 16,

  variants: {
    error: {
      true: { color: '$error' },
    },
    success: {
      true: { color: '$success' },
    },
  } as const,
});

/**
 * 필수 표시
 */
const RequiredMark = styled(Text, {
  color: '$error',
  marginLeft: 2,
  fontWeight: '600',
});

/**
 * 입력 필드 래퍼 (아이콘 포함)
 */
const InputWrapper = styled(XStack, {
  name: 'InputWrapper',
  position: 'relative',
  alignItems: 'center',
});

/**
 * 좌측 아이콘 컨테이너
 */
const LeftIconContainer = styled(View, {
  name: 'LeftIconContainer',
  position: 'absolute',
  zIndex: 1,
  left: 0,
  justifyContent: 'center',
  alignItems: 'center',
  width: 44,
  height: '100%',
});

/**
 * 우측 아이콘 컨테이너
 */
const RightIconContainer = styled(View, {
  name: 'RightIconContainer',
  position: 'absolute',
  zIndex: 1,
  right: 0,
  justifyContent: 'center',
  alignItems: 'center',
  width: 44,
  height: '100%',
});

/**
 * 문자 카운터
 */
const CharacterCounter = styled(Text, {
  name: 'CharacterCounter',
  fontSize: 11,
  color: '$colorMuted',
  textAlign: 'right',

  variants: {
    warning: {
      true: { color: '$warning' },
    },
    error: {
      true: { color: '$error' },
    },
  } as const,
});

/**
 * TextField Props
 */
interface TextFieldProps extends InputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  maxLength?: number;
  showCharacterCount?: boolean;
}

/**
 * TextField 컴포넌트
 */
export function TextField({
  label,
  helperText,
  errorMessage,
  successMessage,
  required,
  size = 'md',
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
  showCharacterCount = false,
  value,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const hasError = !!errorMessage;
  const hasSuccess = !!successMessage;
  const inputSize = size as 'sm' | 'md' | 'lg' | 'senior';

  // 포커스 애니메이션
  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    onBlur?.(e);
  };

  // 입력 상태 결정
  const status = hasError ? 'error' : hasSuccess ? 'success' : 'default';

  // 문자 수 계산
  const currentLength = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength && currentLength >= maxLength * 0.9;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <TextFieldContainer>
      {/* 라벨 */}
      {label && (
        <XStack alignItems="center">
          <TextFieldLabel
            error={hasError}
            focused={isFocused && !hasError}
            size={inputSize}
          >
            {label}
          </TextFieldLabel>
          {required && <RequiredMark>*</RequiredMark>}
        </XStack>
      )}

      {/* 입력 필드 */}
      <InputWrapper>
        {leftIcon && <LeftIconContainer>{leftIcon}</LeftIconContainer>}

        <Input
          size={inputSize}
          status={status}
          fullWidth
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
          value={value}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...inputProps}
        />

        {rightIcon && (
          <RightIconContainer>
            {onRightIconPress ? (
              <XStack onPress={onRightIconPress} padding="$2">
                {rightIcon}
              </XStack>
            ) : (
              rightIcon
            )}
          </RightIconContainer>
        )}
      </InputWrapper>

      {/* 하단 정보 영역 */}
      <XStack justifyContent="space-between" alignItems="flex-start">
        {/* 에러/성공/헬퍼 메시지 */}
        <YStack flex={1}>
          {errorMessage && <TextFieldHelper error>{errorMessage}</TextFieldHelper>}
          {successMessage && !errorMessage && (
            <TextFieldHelper success>{successMessage}</TextFieldHelper>
          )}
          {helperText && !errorMessage && !successMessage && (
            <TextFieldHelper>{helperText}</TextFieldHelper>
          )}
        </YStack>

        {/* 문자 카운터 */}
        {showCharacterCount && maxLength && (
          <CharacterCounter warning={!!isNearLimit} error={!!isAtLimit}>
            {currentLength}/{maxLength}
          </CharacterCounter>
        )}
      </XStack>
    </TextFieldContainer>
  );
}

/**
 * PasswordField - 비밀번호 전용 필드
 */
interface PasswordFieldProps extends Omit<TextFieldProps, 'secureTextEntry'> {
  showPasswordIcon?: React.ReactNode;
  hidePasswordIcon?: React.ReactNode;
}

export function PasswordField({
  showPasswordIcon,
  hidePasswordIcon,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 기본 아이콘 (텍스트 기반)
  const defaultShowIcon = (
    <Text fontSize={12} color="$colorMuted">
      보기
    </Text>
  );
  const defaultHideIcon = (
    <Text fontSize={12} color="$colorMuted">
      숨김
    </Text>
  );

  return (
    <TextField
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={showPassword ? hidePasswordIcon || defaultHideIcon : showPasswordIcon || defaultShowIcon}
      onRightIconPress={togglePasswordVisibility}
    />
  );
}

/**
 * SearchField - 검색 전용 필드
 */
interface SearchFieldProps extends TextFieldProps {
  searchIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  onClear?: () => void;
}

export function SearchField({
  searchIcon,
  clearIcon,
  onClear,
  value,
  ...props
}: SearchFieldProps) {
  const hasValue = typeof value === 'string' && value.length > 0;

  // 기본 검색 아이콘 (텍스트 기반)
  const defaultSearchIcon = (
    <Text fontSize={16} color="$colorMuted">
      ?
    </Text>
  );

  // 기본 클리어 아이콘
  const defaultClearIcon = (
    <Text fontSize={16} color="$colorMuted">
      x
    </Text>
  );

  return (
    <TextField
      {...props}
      value={value}
      leftIcon={searchIcon || defaultSearchIcon}
      rightIcon={hasValue ? clearIcon || defaultClearIcon : undefined}
      onRightIconPress={hasValue ? onClear : undefined}
      placeholder={props.placeholder || '검색...'}
    />
  );
}

export type { TextFieldProps, PasswordFieldProps, SearchFieldProps };
export default TextField;
