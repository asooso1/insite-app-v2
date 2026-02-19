/**
 * GlassSearchInput 컴포넌트
 *
 * 2026 Modern UI - Glassmorphism 스타일 검색 입력
 * 반투명 배경과 아이콘 검색창
 */
import React from 'react';
import { Platform, ViewStyle, TextStyle, TextInput } from 'react-native';
import { XStack } from 'tamagui';
import { AppIcon } from '@/components/icons';
import { shadows, COLOR_HEX } from '@/theme/tokens';

interface GlassSearchInputProps {
  /** 값 */
  value: string;
  /** 값 변경 이벤트 */
  onChangeText: (text: string) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 클리어 버튼 표시 */
  showClear?: boolean;
  /** 클리어 이벤트 */
  onClear?: () => void;
  /** 자동 포커스 */
  autoFocus?: boolean;
}

/**
 * Glassmorphism 검색 입력
 *
 * @example
 * ```tsx
 * <GlassSearchInput
 *   value={search}
 *   onChangeText={setSearch}
 *   placeholder="작업명, 건물, 담당자로 검색"
 * />
 * ```
 */
export function GlassSearchInput({
  value,
  onChangeText,
  placeholder = '검색...',
  showClear = true,
  onClear,
  autoFocus = false,
}: GlassSearchInputProps) {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <XStack
      backgroundColor="rgba(255, 255, 255, 0.9)"
      borderRadius={16}
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.5)"
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      gap="$3"
      style={
        Platform.select({
          ios: shadows.sm as ViewStyle,
          android: { elevation: 2 },
        }) as ViewStyle
      }
    >
      {/* 검색 아이콘 */}
      <AppIcon name="search" size="md" color="$gray400" />

      {/* 입력 필드 */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLOR_HEX.gray400}
        style={inputStyle}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* 클리어 버튼 */}
      {showClear && value.length > 0 && (
        <XStack
          padding="$1"
          pressStyle={{ opacity: 0.6 }}
          onPress={handleClear}
          cursor="pointer"
        >
          <AppIcon name="close" size="sm" color="$gray400" />
        </XStack>
      )}
    </XStack>
  );
}

const inputStyle: TextStyle = {
  flex: 1,
  fontSize: 15,
  color: COLOR_HEX.gray900,
  padding: 0,
  margin: 0,
};

export default GlassSearchInput;
