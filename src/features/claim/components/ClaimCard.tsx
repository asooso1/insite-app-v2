/**
 * ClaimCard 컴포넌트
 *
 * 고객불편 목록 카드
 */
import React from 'react';
import { Platform, ViewStyle, View } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import type { ClaimDTO } from '../types';
import { CLAIM_TEMPLATES } from '../types';

interface ClaimCardProps {
  claim: ClaimDTO;
  onPress: (claim: ClaimDTO) => void;
}

/**
 * 상태별 색상
 */
const STATE_COLORS: Record<string, { bg: string; text: string }> = {
  RECEIVED: { bg: '#FEF3C7', text: '#92400E' },
  PROCESSING: { bg: '#DBEAFE', text: '#1E40AF' },
  COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
  REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
};

export function ClaimCard({ claim, onPress }: ClaimCardProps) {
  const statusColor = STATE_COLORS[claim.state] || STATE_COLORS.RECEIVED;
  const template = claim.templateType
    ? CLAIM_TEMPLATES[claim.templateType as keyof typeof CLAIM_TEMPLATES]
    : null;

  const bgColor = (statusColor?.bg || '#FEF3C7') as any;
  const textColor = (statusColor?.text || '#92400E') as any;

  return (
    <View>
      <YStack
        backgroundColor="$surface"
        borderRadius={16}
        padding="$4"
        gap="$3"
        borderWidth={1}
        borderColor="$gray100"
        pressStyle={{ opacity: 0.95, scale: 0.98 }}
        onPress={() => onPress(claim)}
        style={
          Platform.select({
            ios: {
              shadowColor: '#0066CC',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 2,
            },
          }) as ViewStyle
        }
      >
        {/* 상단: 상태 배지 + 날짜 */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack
            backgroundColor={bgColor}
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            borderRadius={12}
          >
            <Text fontSize={12} fontWeight="600" color={textColor}>
              {claim.stateName || claim.state}
            </Text>
          </XStack>

          <Text fontSize={12} color="$gray500">
            {claim.receivedDate}
          </Text>
        </XStack>

        {/* 제목 + 템플릿 아이콘 */}
        <XStack gap="$2" alignItems="center">
          {template && (
            <Text fontSize={20} lineHeight={24}>
              {template.icon}
            </Text>
          )}
          <Text fontSize={16} fontWeight="700" color="$gray900" flex={1} numberOfLines={2}>
            {claim.title}
          </Text>
        </XStack>

        {/* 내용 */}
        <Text fontSize={14} color="$gray600" numberOfLines={2} lineHeight={20}>
          {claim.content}
        </Text>

        {/* 하단: 위치 + 전화번호 */}
        <XStack justifyContent="space-between" alignItems="center" paddingTop="$2">
          <XStack gap="$1.5" alignItems="center" flex={1}>
            <Text fontSize={13} color="$gray500">
              📍
            </Text>
            <Text fontSize={13} color="$gray700" numberOfLines={1} flex={1}>
              {[claim.buildingName, claim.floor, claim.zone].filter(Boolean).join(' · ')}
            </Text>
          </XStack>

          {claim.phoneNumber && (
            <Text fontSize={13} color="$gray500">
              📞 {claim.phoneNumber}
            </Text>
          )}
        </XStack>

        {/* 첨부파일 표시 */}
        {claim.attachments && claim.attachments.length > 0 && (
          <XStack gap="$2" alignItems="center" paddingTop="$1">
            <Text fontSize={13} color="$primary">
              📎 첨부파일 {claim.attachments.length}개
            </Text>
          </XStack>
        )}
      </YStack>
    </View>
  );
}
