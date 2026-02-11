/**
 * 시니어 모드 전용 카드 컴포넌트
 *
 * 시니어 UX 가이드라인 적용:
 * - 테두리로 영역 구분 명확하게
 * - 넓은 패딩
 * - 그림자 강화로 카드 구분
 * - 고대비 텍스트
 *
 * 참조:
 * - https://toss.tech/article/senior-usability-research
 * - https://www.nngroup.com/reports/senior-citizens-on-the-web/
 */
import React, { useState } from 'react';
import { Pressable, ViewStyle, TextStyle } from 'react-native';
import { YStack, XStack, Text, View } from 'tamagui';
import { SENIOR_STYLES } from '@/theme/seniorMode';

const { card, colors, fontSize, spacing, touchTarget } = SENIOR_STYLES;

/**
 * 시니어 카드 Props
 */
interface SeniorCardProps {
  /** 카드 내용 */
  children: React.ReactNode;
  /** 클릭 핸들러 (있으면 pressable) */
  onPress?: () => void;
  /** 카드 변형 */
  variant?: 'default' | 'outlined' | 'elevated' | 'success' | 'warning' | 'error';
  /** 전체 너비 */
  fullWidth?: boolean;
  /** 테스트 ID */
  testID?: string;
  /** 추가 스타일 */
  style?: ViewStyle;
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

/**
 * 변형별 스타일 정의
 */
interface VariantStyle {
  backgroundColor: string;
  borderColor: string;
  shadowOpacity?: number;
}

const VARIANT_STYLES: Record<string, VariantStyle> = {
  default: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  outlined: {
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
  },
  elevated: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    shadowOpacity: 0.2,
  },
  success: {
    backgroundColor: '#F0FFF4',
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: '#FFFAF0',
    borderColor: colors.warning,
  },
  error: {
    backgroundColor: '#FFF5F5',
    borderColor: colors.error,
  },
};

/**
 * 시니어 모드 전용 카드
 *
 * 명확한 테두리와 그림자로 카드 영역을 구분합니다.
 *
 * @example
 * ```tsx
 * <SeniorCard onPress={handlePress}>
 *   <SeniorCardTitle>작업 제목</SeniorCardTitle>
 *   <SeniorCardDescription>작업 설명</SeniorCardDescription>
 * </SeniorCard>
 * ```
 */
export function SeniorCard({
  children,
  onPress,
  variant = 'default',
  fullWidth = true,
  testID,
  style,
  accessibilityLabel,
}: SeniorCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const isPressable = !!onPress;

  // 안전한 스타일 접근
  const bgColor = variantStyle?.backgroundColor || colors.cardBackground;
  const borderColorVal = variantStyle?.borderColor || colors.border;
  const shadowOpacityVal = variantStyle?.shadowOpacity ?? card.shadowOpacity;

  const containerStyle: ViewStyle = {
    padding: card.padding,
    borderRadius: card.borderRadius,
    borderWidth: card.borderWidth,
    borderColor: borderColorVal,
    backgroundColor: bgColor,
    width: fullWidth ? '100%' : undefined,
    // 그림자
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: isPressed ? 2 : 4 },
    shadowOpacity: shadowOpacityVal,
    shadowRadius: card.shadowRadius,
    elevation: isPressed ? 2 : 4,
    // 눌림 효과
    ...(isPressable && {
      transform: [{ scale: isPressed ? 0.98 : 1 }],
      opacity: isPressed ? 0.9 : 1,
    }),
    ...style,
  };

  if (isPressable) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={containerStyle} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

/**
 * 시니어 카드 제목
 */
interface SeniorCardTitleProps {
  children: React.ReactNode;
  /** 크기 */
  size?: 'md' | 'lg';
}

export function SeniorCardTitle({ children, size = 'md' }: SeniorCardTitleProps) {
  const textStyle: TextStyle = {
    fontSize: size === 'lg' ? fontSize.title : fontSize.large, // 32px or 24px
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  };

  return <Text style={textStyle}>{children}</Text>;
}

/**
 * 시니어 카드 부제목/설명
 */
interface SeniorCardDescriptionProps {
  children: React.ReactNode;
  /** 색상 */
  color?: 'default' | 'muted' | 'accent';
}

export function SeniorCardDescription({ children, color = 'default' }: SeniorCardDescriptionProps) {
  const colorMap = {
    default: colors.textSecondary,
    muted: colors.textMuted,
    accent: colors.primary,
  };

  const textStyle: TextStyle = {
    fontSize: fontSize.medium, // 20px
    fontWeight: '400',
    color: colorMap[color],
    lineHeight: fontSize.medium * 1.5, // 30px
  };

  return <Text style={textStyle}>{children}</Text>;
}

/**
 * 시니어 카드 헤더 (제목 + 액션)
 */
interface SeniorCardHeaderProps {
  /** 제목 */
  title: string;
  /** 부제목 */
  subtitle?: string;
  /** 오른쪽 액션 요소 */
  action?: React.ReactNode;
}

export function SeniorCardHeader({ title, subtitle, action }: SeniorCardHeaderProps) {
  return (
    <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$4">
      <YStack flex={1} gap="$1">
        <Text
          style={{
            fontSize: fontSize.large, // 24px
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: fontSize.medium, // 20px
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </YStack>
      {action}
    </XStack>
  );
}

/**
 * 시니어 카드 리스트 아이템
 *
 * 리스트 형태의 카드 아이템으로, 충분한 터치 영역 확보
 */
interface SeniorCardListItemProps {
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 제목 */
  title: string;
  /** 부제목 */
  subtitle?: string;
  /** 오른쪽 요소 */
  right?: React.ReactNode;
  /** 클릭 핸들러 */
  onPress?: () => void;
  /** 테두리 표시 */
  showBorder?: boolean;
}

export function SeniorCardListItem({
  leftIcon,
  title,
  subtitle,
  right,
  onPress,
  showBorder = true,
}: SeniorCardListItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.listItemGap,
    paddingHorizontal: 4,
    minHeight: touchTarget.listItem,
    gap: spacing.inlineGap,
    ...(showBorder && {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }),
    ...(onPress && {
      backgroundColor: isPressed ? colors.disabledBackground : 'transparent',
    }),
  };

  const content = (
    <>
      {leftIcon && (
        <View style={{ width: 40, alignItems: 'center' }}>
          {typeof leftIcon === 'string' ? (
            <Text style={{ fontSize: 28 }}>{leftIcon}</Text>
          ) : (
            leftIcon
          )}
        </View>
      )}
      <YStack flex={1} gap="$1">
        <Text
          style={{
            fontSize: fontSize.medium, // 20px
            fontWeight: '600',
            color: colors.text,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: fontSize.small, // 18px
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </YStack>
      {right && <View style={{ marginLeft: 8 }}>{right}</View>}
      {onPress && !right && <Text style={{ fontSize: 24, color: colors.textMuted }}>→</Text>}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

/**
 * 시니어 카드 푸터
 */
interface SeniorCardFooterProps {
  children: React.ReactNode;
  /** 구분선 표시 */
  showDivider?: boolean;
}

export function SeniorCardFooter({ children, showDivider = true }: SeniorCardFooterProps) {
  return (
    <XStack
      marginTop="$4"
      paddingTop={showDivider ? '$4' : 0}
      borderTopWidth={showDivider ? 1 : 0}
      borderTopColor={colors.border}
      gap="$3"
      justifyContent="flex-end"
    >
      {children}
    </XStack>
  );
}

/**
 * 시니어 상태 배지
 */
interface SeniorStatusBadgeProps {
  /** 상태 */
  status: 'pending' | 'inProgress' | 'completed' | 'error';
  /** 라벨 */
  label: string;
}

const STATUS_STYLES = {
  pending: {
    backgroundColor: '#FFF3E6',
    borderColor: colors.warning,
    textColor: colors.warning,
  },
  inProgress: {
    backgroundColor: '#E6F2FF',
    borderColor: colors.primary,
    textColor: colors.primary,
  },
  completed: {
    backgroundColor: '#E6FFF0',
    borderColor: colors.success,
    textColor: colors.success,
  },
  error: {
    backgroundColor: '#FFE6E6',
    borderColor: colors.error,
    textColor: colors.error,
  },
} as const;

export function SeniorStatusBadge({ status, label }: SeniorStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <XStack
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius={8}
      borderWidth={1}
      backgroundColor={style.backgroundColor}
      borderColor={style.borderColor}
      alignItems="center"
      gap="$2"
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: style.textColor,
        }}
      />
      <Text
        style={{
          fontSize: fontSize.small, // 18px
          fontWeight: '600',
          color: style.textColor,
        }}
      >
        {label}
      </Text>
    </XStack>
  );
}

export type {
  SeniorCardProps,
  SeniorCardTitleProps,
  SeniorCardDescriptionProps,
  SeniorCardHeaderProps,
  SeniorCardListItemProps,
  SeniorCardFooterProps,
  SeniorStatusBadgeProps,
};

export default SeniorCard;
