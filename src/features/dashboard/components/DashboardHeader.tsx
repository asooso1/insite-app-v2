/**
 * 대시보드 헤더 컴포넌트
 */
import React from 'react';
import { YStack, Text } from 'tamagui';

interface DashboardHeaderProps {
  /** 제목 */
  title: string;
  /** 부제목 (선택) */
  subtitle?: string;
}

/**
 * 대시보드 헤더 컴포넌트
 */
export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <YStack
      paddingHorizontal="$4"
      paddingTop="$4"
      paddingBottom="$3"
      backgroundColor="$white"
      borderBottomWidth={1}
      borderBottomColor="$gray200"
    >
      <Text fontSize={24} fontWeight="700" color="$gray900">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize={14} color="$gray600" marginTop="$1">
          {subtitle}
        </Text>
      )}
    </YStack>
  );
}

export default DashboardHeader;
