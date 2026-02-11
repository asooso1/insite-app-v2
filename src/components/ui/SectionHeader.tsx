/**
 * SectionHeader 컴포넌트
 *
 * 2026 Modern UI - 섹션 제목 및 액션 버튼
 * 볼드한 타이틀 + 그라디언트 액센트 라인 + 옵션 액션
 *
 * 시니어 모드 지원:
 * - 커스텀 폰트 크기 지원
 * - 고대비 색상
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/tokens';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

interface SectionHeaderProps {
  /** 섹션 제목 */
  title: string;
  /** 우측 액션 텍스트 */
  actionText?: string;
  /** 액션 클릭 이벤트 */
  onAction?: () => void;
  /** 액센트 라인 표시 */
  showAccent?: boolean;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 수평 패딩 적용 여부 */
  padded?: boolean;
  /** 커스텀 폰트 크기 (시니어 모드용) */
  fontSize?: number;
}

/**
 * 섹션 헤더
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="오늘의 작업"
 *   actionText="전체보기"
 *   onAction={() => router.push('/work')}
 *   showAccent
 * />
 * ```
 */
export function SectionHeader({
  title,
  actionText,
  onAction,
  showAccent = true,
  size = 'md',
  padded = false,
  fontSize: customFontSize,
}: SectionHeaderProps) {
  const seniorStyles = useSeniorStyles();
  const { isSeniorMode } = seniorStyles;

  const getSizing = () => {
    // 시니어 모드일 때 확대된 사이즈
    if (isSeniorMode) {
      switch (size) {
        case 'sm':
          return { fontSize: 20, accentWidth: 4, accentHeight: 22 };
        case 'lg':
          return { fontSize: 28, accentWidth: 5, accentHeight: 32 };
        case 'md':
        default:
          return { fontSize: 24, accentWidth: 5, accentHeight: 28 };
      }
    }

    // 일반 모드
    switch (size) {
      case 'sm':
        return { fontSize: 15, accentWidth: 3, accentHeight: 16 };
      case 'lg':
        return { fontSize: 20, accentWidth: 4, accentHeight: 24 };
      case 'md':
      default:
        return { fontSize: 17, accentWidth: 4, accentHeight: 20 };
    }
  };

  const sizing = getSizing();
  // 커스텀 폰트 크기가 있으면 사용
  const finalFontSize = customFontSize ?? sizing.fontSize;

  // 시니어 모드용 고대비 그라디언트 색상
  const gradientColors = isSeniorMode
    ? (['#003366', '#004D99'] as const) // 더 진한 파란색
    : ([...gradients.primary] as const);

  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      marginBottom={isSeniorMode ? '$4' : '$3'}
      paddingHorizontal={padded ? '$5' : 0}
    >
      <XStack alignItems="center" gap={isSeniorMode ? '$3' : '$2'}>
        {/* 그라디언트 액센트 라인 */}
        {showAccent && (
          <YStack
            width={sizing.accentWidth}
            height={sizing.accentHeight}
            borderRadius={sizing.accentWidth / 2}
            overflow="hidden"
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            />
          </YStack>
        )}

        {/* 제목 */}
        <Text
          fontSize={finalFontSize}
          fontWeight="700"
          color={isSeniorMode ? (seniorStyles.colors.text as any) : '$gray900'}
          letterSpacing={-0.3}
        >
          {title}
        </Text>
      </XStack>

      {/* 액션 버튼 - 시니어 모드에서 더 크게 */}
      {actionText && onAction && (
        <XStack
          paddingHorizontal={isSeniorMode ? '$3' : 0}
          paddingVertical={isSeniorMode ? '$2' : 0}
          borderRadius={isSeniorMode ? 8 : 0}
          borderWidth={isSeniorMode ? 1 : 0}
          borderColor={isSeniorMode ? (seniorStyles.colors.primary as any) : 'transparent'}
          pressStyle={{ opacity: 0.7 }}
          onPress={onAction}
        >
          <Text
            fontSize={isSeniorMode ? seniorStyles.fontSize.medium : 14}
            fontWeight={isSeniorMode ? '600' : '500'}
            color={isSeniorMode ? (seniorStyles.colors.primary as any) : '$primary'}
          >
            {actionText} {isSeniorMode && '→'}
          </Text>
        </XStack>
      )}
    </XStack>
  );
}

export default SectionHeader;
