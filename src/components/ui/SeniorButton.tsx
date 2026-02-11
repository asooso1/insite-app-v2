/**
 * 시니어 모드 전용 버튼 컴포넌트
 *
 * 시니어 UX 가이드라인 적용:
 * - 항상 텍스트 라벨 필수 (아이콘만 있는 버튼 금지)
 * - 테두리로 클릭 가능 영역 명확히 표시
 * - 56px 이상 높이
 * - 강한 눌림 효과
 * - 고대비 색상
 *
 * 참조:
 * - https://toss.tech/article/senior-usability-research
 * - https://www.nngroup.com/reports/senior-citizens-on-the-web/
 */
import React, { useState } from 'react';
import { Pressable, ActivityIndicator, ViewStyle, TextStyle, View, Text } from 'react-native';
import { SENIOR_STYLES } from '@/theme/seniorMode';

const { button, colors, fontSize } = SENIOR_STYLES;

/**
 * 시니어 버튼 Props
 */
interface SeniorButtonProps {
  /** 버튼 텍스트 (필수) */
  label: string;
  /** 클릭 핸들러 */
  onPress?: () => void;
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  /** 전체 너비 */
  fullWidth?: boolean;
  /** 비활성화 */
  disabled?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 왼쪽 아이콘 (이모지 또는 컴포넌트) */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 (이모지 또는 컴포넌트) */
  rightIcon?: React.ReactNode;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 변형별 스타일 정의
 */
const VARIANT_STYLES = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    textColor: '#FFFFFF',
  },
  secondary: {
    backgroundColor: colors.accent,
    borderColor: colors.accentLight,
    textColor: '#FFFFFF',
  },
  outline: {
    backgroundColor: colors.background,
    borderColor: colors.buttonBorder,
    textColor: colors.text,
  },
  danger: {
    backgroundColor: colors.error,
    borderColor: '#990000',
    textColor: '#FFFFFF',
  },
  success: {
    backgroundColor: colors.success,
    borderColor: '#004D26',
    textColor: '#FFFFFF',
  },
} as const;

/**
 * 시니어 모드 전용 버튼
 *
 * 항상 텍스트 라벨이 있어야 하며, 클릭 가능함을 명확히 표시합니다.
 *
 * @example
 * ```tsx
 * <SeniorButton
 *   label="작업 시작"
 *   leftIcon="📋"
 *   onPress={handleStart}
 * />
 * ```
 */
export function SeniorButton({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  testID,
}: SeniorButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled || loading;

  const variantStyle = VARIANT_STYLES[variant];

  // 컨테이너 스타일
  const containerStyle: ViewStyle = {
    height: button.height,
    paddingHorizontal: button.paddingHorizontal,
    borderRadius: button.borderRadius,
    borderWidth: button.borderWidth,
    borderColor: variantStyle.borderColor,
    backgroundColor: variantStyle.backgroundColor,
    width: fullWidth ? '100%' : undefined,
    alignSelf: fullWidth ? 'stretch' : 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    // 눌림 효과 - 시니어 모드에서는 더 강하게
    transform: [{ scale: isPressed ? 0.95 : 1 }],
    opacity: isPressed ? 0.85 : 1,
    // 그림자 (클릭 가능함을 강조)
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: isPressed ? 1 : 3 },
    shadowOpacity: isPressed ? 0.15 : 0.25,
    shadowRadius: isPressed ? 2 : 6,
    elevation: isPressed ? 2 : 6,
    // 비활성화 스타일
    ...(isDisabled && {
      backgroundColor: colors.disabledBackground,
      borderColor: colors.border,
      opacity: 0.6,
    }),
  };

  // 텍스트 스타일
  const textStyle: TextStyle = {
    fontSize: button.fontSize,
    fontWeight: button.fontWeight,
    color: isDisabled ? colors.textMuted : variantStyle.textColor,
    letterSpacing: 0.5,
  };

  // 아이콘 스타일
  const iconStyle: TextStyle = {
    fontSize: fontSize.large, // 24px
  };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={isDisabled}
      style={containerStyle}
      // 접근성
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.textColor} />
      ) : (
        <>
          {leftIcon && (
            <View style={{ marginRight: 4 }}>
              {typeof leftIcon === 'string' ? <Text style={iconStyle}>{leftIcon}</Text> : leftIcon}
            </View>
          )}
          <Text style={textStyle}>{label}</Text>
          {rightIcon && (
            <View style={{ marginLeft: 4 }}>
              {typeof rightIcon === 'string' ? (
                <Text style={iconStyle}>{rightIcon}</Text>
              ) : (
                rightIcon
              )}
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

/**
 * 시니어 모드 아이콘 버튼 (라벨 필수)
 *
 * 시니어 모드에서는 아이콘만 있는 버튼을 피해야 하지만,
 * 필요한 경우 반드시 텍스트 라벨을 함께 표시합니다.
 */
interface SeniorIconButtonProps {
  /** 아이콘 (이모지 또는 컴포넌트) */
  icon: React.ReactNode;
  /** 라벨 (시니어 모드에서는 필수) */
  label: string;
  /** 클릭 핸들러 */
  onPress?: () => void;
  /** 변형 */
  variant?: 'primary' | 'outline' | 'ghost';
  /** 비활성화 */
  disabled?: boolean;
  /** 크기 */
  size?: 'md' | 'lg';
  /** 테스트 ID */
  testID?: string;
}

const ICON_BUTTON_VARIANT_STYLES = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    textColor: '#FFFFFF',
  },
  outline: {
    backgroundColor: colors.background,
    borderColor: colors.buttonBorder,
    textColor: colors.text,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: colors.primary,
  },
} as const;

export function SeniorIconButton({
  icon,
  label,
  onPress,
  variant = 'outline',
  disabled = false,
  size = 'md',
  testID,
}: SeniorIconButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variantStyle = ICON_BUTTON_VARIANT_STYLES[variant];
  const dimension = size === 'lg' ? 72 : 60;

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: 16,
    borderWidth: variant === 'ghost' ? 0 : 2,
    borderColor: variantStyle.borderColor,
    backgroundColor: variantStyle.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    transform: [{ scale: isPressed ? 0.95 : 1 }],
    opacity: isPressed ? 0.85 : disabled ? 0.5 : 1,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: isPressed ? 1 : 2 },
    shadowOpacity: variant === 'ghost' ? 0 : 0.15,
    shadowRadius: isPressed ? 2 : 4,
    elevation: variant === 'ghost' ? 0 : isPressed ? 1 : 3,
  };

  const iconStyle: TextStyle = {
    fontSize: size === 'lg' ? 28 : 24,
  };

  const labelStyle: TextStyle = {
    fontSize: 11,
    fontWeight: '600',
    color: variantStyle.textColor,
    textAlign: 'center',
  };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {typeof icon === 'string' ? <Text style={iconStyle}>{icon}</Text> : icon}
      <Text style={labelStyle} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export type { SeniorButtonProps, SeniorIconButtonProps };
export default SeniorButton;
