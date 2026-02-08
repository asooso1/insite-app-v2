/**
 * SectionHeader 컴포넌트
 *
 * 2026 Modern UI - 섹션 제목 및 액션 버튼
 * 볼드한 타이틀 + 그라디언트 액센트 라인 + 옵션 액션
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme/tokens';

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
}: SectionHeaderProps) {
  const getSizing = () => {
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

  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      marginBottom="$3"
      paddingHorizontal={padded ? '$5' : 0}
    >
      <XStack alignItems="center" gap="$2">
        {/* 그라디언트 액센트 라인 */}
        {showAccent && (
          <YStack
            width={sizing.accentWidth}
            height={sizing.accentHeight}
            borderRadius={sizing.accentWidth / 2}
            overflow="hidden"
          >
            <LinearGradient
              colors={[...gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            />
          </YStack>
        )}

        {/* 제목 */}
        <Text
          fontSize={sizing.fontSize}
          fontWeight="700"
          color="$gray900"
          letterSpacing={-0.3}
        >
          {title}
        </Text>
      </XStack>

      {/* 액션 버튼 */}
      {actionText && onAction && (
        <Text
          fontSize={14}
          fontWeight="500"
          color="$primary"
          pressStyle={{ opacity: 0.7 }}
          onPress={onAction}
        >
          {actionText}
        </Text>
      )}
    </XStack>
  );
}

export default SectionHeader;
