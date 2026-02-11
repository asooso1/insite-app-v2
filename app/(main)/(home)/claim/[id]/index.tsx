/**
 * 고객불편(VOC) 상세 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 카드 섹션
 * 상태에 따른 액션 버튼 제공
 * 시니어 모드 지원: 확대된 텍스트, 테두리 강조, 고대비 배지
 */
import React, { useMemo } from 'react';
import { ScrollView, Alert, Platform, ViewStyle, Pressable, View, Linking } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CLAIM_TEMPLATES } from '@/features/claim/types';
import type { ClaimState } from '@/features/claim/types';
import { gradients } from '@/theme/tokens';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { useClaimDetail } from '@/features/claim/hooks';

/**
 * 상태별 그라디언트 색상
 */
const STATUS_GRADIENTS = {
  RECEIVED: ['#FFB300', '#FFA000'] as [string, string],
  PROCESSING: ['#0066CC', '#00A3FF'] as [string, string],
  COMPLETED: ['#00A043', '#00C853'] as [string, string],
  REJECTED: ['#DC2626', '#EF4444'] as [string, string],
} as const;

function getStatusGradient(state: ClaimState): [string, string] {
  return STATUS_GRADIENTS[state] || STATUS_GRADIENTS.RECEIVED;
}

/**
 * 상태 한글명 매핑
 */
const STATUS_NAMES: Record<ClaimState, string> = {
  RECEIVED: '접수',
  PROCESSING: '처리중',
  COMPLETED: '완료',
  REJECTED: '반려',
};

/**
 * 고객불편 상세 화면
 */
export default function ClaimDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const claimId = parseInt(id || '0', 10);
  const { isSeniorMode, card: cardStyles, fontSize } = useSeniorStyles();

  // Hook 사용 (Mock 모드)
  const { claim, updateStatus, isUpdatingStatus, isCreatingWorkOrder } = useClaimDetail({
    claimId,
    useMock: true,
  });

  /**
   * 처리 시작
   */
  const handleStartProcess = () => {
    Alert.alert('처리 시작', '고객불편 처리를 시작하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '시작',
        onPress: () => {
          Alert.alert('알림', '처리가 시작되었습니다.');
        },
      },
    ]);
  };

  /**
   * 처리 완료
   */
  const handleComplete = () => {
    Alert.alert('처리 완료', '고객불편 처리를 완료하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: () => {
          Alert.alert('알림', '처리가 완료되었습니다.');
        },
      },
    ]);
  };

  /**
   * 반려 처리
   */
  const handleReject = () => {
    Alert.alert('반려', '고객불편을 반려하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '반려',
        style: 'destructive',
        onPress: () => {
          updateStatus({ status: 'REJECTED' });
          Alert.alert('알림', '반려되었습니다.');
        },
      },
    ]);
  };

  /**
   * 수시업무 발행
   */
  const handleCreateWorkOrder = () => {
    if (!claim) return;

    Alert.alert('수시업무 발행', '해당 고객불편에 대한 수시업무를 발행하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '발행',
        onPress: () => {
          // 작업지시 등록 화면으로 이동하면서 데이터 전달
          router.push({
            pathname: '/work/create',
            params: {
              fromClaim: 'true',
              claimId: claim.id.toString(),
              title: `[${claim.buildingName || ''}${claim.floor ? ` ${claim.floor}` : ''}] ${claim.title}`,
              description: claim.content,
              location: [claim.buildingName, claim.floor, claim.zone, claim.location]
                .filter(Boolean)
                .join(' > '),
            },
          });
        },
      },
    ]);
  };

  /**
   * 전화 걸기
   */
  const handleCallPhone = (phone: string) => {
    const phoneNumber = Platform.OS === 'ios' ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.openURL(phoneNumber);
  };

  if (!claim) {
    return (
      <YStack flex={1} backgroundColor="$gray50">
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          title="오류 발생"
          description="고객불편 정보를 찾을 수 없습니다."
          actionLabel="목록으로"
          onAction={() => router.back()}
        />
      </YStack>
    );
  }

  const statusGradient = getStatusGradient(claim.state);
  const statusName = claim.stateName || STATUS_NAMES[claim.state];
  const template = claim.templateType
    ? CLAIM_TEMPLATES[claim.templateType as keyof typeof CLAIM_TEMPLATES]
    : null;

  /**
   * 상태에 따른 액션 버튼 렌더링
   */
  const renderActionButtons = useMemo(() => {
    switch (claim.state) {
      case 'RECEIVED':
        return (
          <XStack gap="$3" width="100%">
            <YStack flex={1}>
              <GradientActionButton
                label="처리 시작"
                onPress={handleStartProcess}
                loading={isUpdatingStatus}
                gradient={gradients.accent}
              />
            </YStack>
            <YStack flex={1}>
              <GradientActionButton
                label="수시업무 발행"
                onPress={handleCreateWorkOrder}
                loading={isCreatingWorkOrder}
                gradient={gradients.success}
              />
            </YStack>
          </XStack>
        );

      case 'PROCESSING':
        return (
          <YStack gap="$3" width="100%">
            <XStack gap="$3" width="100%">
              <YStack flex={1}>
                <Button onPress={handleReject} variant="outline" fullWidth size="lg">
                  반려
                </Button>
              </YStack>
              <YStack flex={1}>
                <GradientActionButton
                  label="처리 완료"
                  onPress={handleComplete}
                  loading={isUpdatingStatus}
                  gradient={gradients.success}
                />
              </YStack>
            </XStack>
            <GradientActionButton
              label="수시업무 발행"
              onPress={handleCreateWorkOrder}
              loading={isCreatingWorkOrder}
              gradient={gradients.primary}
            />
          </YStack>
        );

      case 'COMPLETED':
      case 'REJECTED':
      default:
        return null;
    }
  }, [claim.state, isUpdatingStatus, isCreatingWorkOrder]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      <Stack.Screen options={{ headerShown: false }} />

      {/* 그라디언트 헤더 */}
      <YStack>
        <LinearGradient
          colors={statusGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top,
            paddingBottom: 40,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          {/* 네비게이션 바 */}
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            alignItems="center"
            justifyContent="space-between"
          >
            <Pressable onPress={() => router.back()}>
              <XStack
                backgroundColor="rgba(255, 255, 255, 0.2)"
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius={12}
                alignItems="center"
                gap="$1"
              >
                <Text fontSize={16} color="$white">
                  ←
                </Text>
                <Text fontSize={14} fontWeight="600" color="$white">
                  뒤로
                </Text>
              </XStack>
            </Pressable>

            {/* 상태 배지 */}
            <YStack
              backgroundColor="rgba(255, 255, 255, 0.25)"
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius={20}
            >
              <Text fontSize={14} fontWeight="700" color="$white">
                {statusName}
              </Text>
            </YStack>
          </XStack>

          {/* 제목 + 템플릿 아이콘 */}
          <YStack paddingHorizontal="$5" paddingTop="$2">
            <XStack gap="$2" alignItems="center">
              {template && (
                <Text fontSize={32} lineHeight={36}>
                  {template.icon}
                </Text>
              )}
              <Text
                fontSize={24}
                fontWeight="800"
                color="$white"
                letterSpacing={-0.5}
                numberOfLines={2}
                flex={1}
              >
                {claim.title}
              </Text>
            </XStack>
            {template && (
              <Text fontSize={13} color="rgba(255, 255, 255, 0.8)" marginTop="$1">
                {template.label} 템플릿
              </Text>
            )}
          </YStack>
        </LinearGradient>

        {/* 장식용 원형 오버레이 */}
        <YStack
          position="absolute"
          top={insets.top + 40}
          right={-30}
          width={100}
          height={100}
          borderRadius={50}
          backgroundColor="rgba(255, 255, 255, 0.1)"
          pointerEvents="none"
        />
      </YStack>

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView
        style={{ flex: 1, marginTop: -24 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: renderActionButtons ? 120 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 접수 내용 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
            borderRadius={16}
          >
            <GlassCard floating intensity="heavy">
              <SectionHeader title="접수 내용" size="sm" showAccent />
              <Text fontSize={15} color="$gray800" lineHeight={24} marginTop="$2">
                {claim.content}
              </Text>
            </GlassCard>
          </YStack>
        </View>

        {/* 접수 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
            borderRadius={16}
          >
            <GlassCard intensity="medium">
              <SectionHeader title="접수 정보" size="sm" showAccent />
              <YStack gap="$3" marginTop="$2">
                <InfoRow label="접수일시" value={claim.receivedDate} highlight />
                <InfoRow label="접수자" value={claim.receiverName} />
                {claim.phoneNumber && (
                  <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
                    <Text
                      fontSize={isSeniorMode ? fontSize.small : 14}
                      color="$gray500"
                      flexShrink={0}
                    >
                      전화번호
                    </Text>
                    <Pressable onPress={() => handleCallPhone(claim.phoneNumber!)}>
                      <Text
                        fontSize={isSeniorMode ? fontSize.medium : 14}
                        color="$primary"
                        fontWeight="600"
                        textDecorationLine="underline"
                      >
                        {claim.phoneNumber.length === 11
                          ? `${claim.phoneNumber.slice(0, 3)}-${claim.phoneNumber.slice(3, 7)}-${claim.phoneNumber.slice(7)}`
                          : claim.phoneNumber}
                      </Text>
                    </Pressable>
                  </XStack>
                )}
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 위치 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
            borderRadius={16}
          >
            <GlassCard intensity="medium">
              <SectionHeader title="위치 정보" size="sm" showAccent />
              <YStack gap="$3" marginTop="$2">
                <InfoRow label="건물" value={claim.buildingName} />
                <InfoRow label="층" value={claim.floor} />
                <InfoRow label="구역" value={claim.zone} />
                <InfoRow label="위치 상세" value={claim.location} />
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 처리 정보 섹션 */}
        {(claim.processedDate || claim.completedDate || claim.processorName) && (
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
              borderRadius={16}
            >
              <GlassCard intensity="medium">
                <SectionHeader title="처리 정보" size="sm" showAccent />
                <YStack gap="$3" marginTop="$2">
                  {claim.processedDate && (
                    <InfoRow label="처리 시작일시" value={claim.processedDate} highlight />
                  )}
                  {claim.completedDate && (
                    <InfoRow label="완료일시" value={claim.completedDate} highlight />
                  )}
                  {claim.processorName && <InfoRow label="처리자" value={claim.processorName} />}
                  {claim.processResult && <InfoRow label="처리 결과" value={claim.processResult} />}
                </YStack>
              </GlassCard>
            </YStack>
          </View>
        )}

        {/* 첨부 파일 섹션 */}
        {claim.attachments && claim.attachments.length > 0 && (
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? (cardStyles.borderColor as any) : 'transparent'}
              borderRadius={16}
            >
              <GlassCard intensity="light">
                <SectionHeader title="첨부 파일" size="sm" showAccent />
                <YStack gap="$3" marginTop="$3">
                  {claim.attachments.map((attachment) => (
                    <XStack
                      key={attachment.id}
                      backgroundColor="$gray50"
                      padding="$3"
                      borderRadius={12}
                      gap="$3"
                      alignItems="center"
                    >
                      <Text fontSize={16}>📎</Text>
                      <YStack flex={1}>
                        <Text fontSize={14} fontWeight="600" color="$gray900">
                          {attachment.fileName}
                        </Text>
                        {attachment.fileSize && (
                          <Text fontSize={12} color="$gray500">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  ))}
                </YStack>
              </GlassCard>
            </YStack>
          </View>
        )}
      </ScrollView>

      {/* 액션 버튼 (하단 고정) */}
      {renderActionButtons && (
        <View>
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            paddingHorizontal="$5"
            paddingTop="$4"
            paddingBottom={insets.bottom + 16}
            backgroundColor="$surface"
            borderTopWidth={1}
            borderTopColor="$gray100"
            style={
              Platform.select({
                ios: {
                  shadowColor: '#FF6B00',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                },
                android: {
                  elevation: 8,
                },
              }) as ViewStyle
            }
          >
            {renderActionButtons}
          </YStack>
        </View>
      )}
    </YStack>
  );
}

/**
 * 정보 행 컴포넌트 (시니어 모드 지원)
 */
interface InfoRowProps {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  const { isSeniorMode, fontSize } = useSeniorStyles();

  if (!value) return null;

  return (
    <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
      <Text fontSize={isSeniorMode ? fontSize.small : 14} color="$gray500" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize={isSeniorMode ? fontSize.medium : 14}
        color={highlight ? '$primary' : '$gray900'}
        fontWeight={highlight ? '600' : '500'}
        flex={1}
        textAlign="right"
      >
        {value}
      </Text>
    </XStack>
  );
}

/**
 * 그라디언트 액션 버튼
 */
interface GradientActionButtonProps {
  label: string;
  onPress: () => void;
  gradient?: readonly [string, string];
  loading?: boolean;
}

function GradientActionButton({
  label,
  onPress,
  gradient = gradients.primary,
  loading = false,
}: GradientActionButtonProps) {
  const colors: [string, string] = [gradient[0], gradient[1]];

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => ({
        opacity: pressed || loading ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        flex: 1,
      })}
    >
      <YStack
        borderRadius={16}
        overflow="hidden"
        style={
          Platform.select({
            ios: {
              shadowColor: colors[0],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            },
            android: {
              elevation: 6,
            },
          }) as ViewStyle
        }
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text fontSize={16} fontWeight="700" color="$white">
            {loading ? '처리 중...' : label}
          </Text>
        </LinearGradient>
      </YStack>
    </Pressable>
  );
}
