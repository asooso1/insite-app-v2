/**
 * GlassSearchInput 컴포넌트
 *
 * 2026 Modern UI - Glassmorphism 스타일 검색 입력
 * 반투명 배경과 아이콘 검색창
 */
import React from 'react';
import { StyleSheet, Platform, ViewStyle, TextInput } from 'react-native';
import { XStack, Text } from 'tamagui';

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
      style={Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }) as ViewStyle}
    >
      {/* 검색 아이콘 */}
      <Text fontSize={18} color="$gray400">
        🔍
      </Text>

      {/* 입력 필드 */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.input}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* 클리어 버튼 */}
      {showClear && value.length > 0 && (
        <Text
          fontSize={16}
          color="$gray400"
          pressStyle={{ opacity: 0.6 }}
          onPress={handleClear}
        >
          ✕
        </Text>
      )}
    </XStack>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
    margin: 0,
  },
});

export default GlassSearchInput;
