/**
 * SText - 시니어 모드 지원 텍스트 컴포넌트
 *
 * Tamagui의 Text를 래핑하여 시니어 모드에서 자동으로 폰트 크기를 1.2배로 확대합니다.
 *
 * @example
 * ```tsx
 * <SText fontSize={16} color="$gray900">
 *   일반 모드: 16px, 시니어 모드: 19.2px
 * </SText>
 * ```
 */
import React from 'react';
import { Text, type TextProps } from 'tamagui';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

export type STextProps = TextProps;

/**
 * 시니어 모드 지원 텍스트 컴포넌트
 *
 * - 시니어 모드일 때 fontSize를 1.2배로 자동 스케일링
 * - Tamagui의 모든 Text props 지원
 * - 테마 토큰($gray900, $primary 등) 지원
 */
export function SText({ fontSize, ...props }: STextProps) {
  const { fontScale } = useSeniorMode();

  // fontSize가 숫자인 경우 스케일링 적용
  const scaledFontSize = typeof fontSize === 'number' ? fontSize * fontScale : fontSize;

  return <Text fontSize={scaledFontSize} {...props} />;
}
