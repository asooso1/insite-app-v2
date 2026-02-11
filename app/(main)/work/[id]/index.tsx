/**
 * 작업지시 상세 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 카드 섹션
 * 상태에 따른 액션 버튼 제공
 */
import React, { useMemo } from 'react';
import { ScrollView, Alert, Platform, ViewStyle, Pressable } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AttachmentList } from '@/features/work/components/AttachmentList';
import { useWorkOrderDetail } from '@/features/work/hooks/useWorkOrderDetail';
import { gradients } from '@/theme/tokens';

/**
 * 상태별 그라디언트 색상
 */
const STATUS_GRADIENTS = {
  WRITE: ['#64748B', '#94A3B8'] as [string, string],
  ISSUE: ['#00C853', '#69F0AE'] as [string, string],
  PROCESSING: ['#FF6B00', '#FFB800'] as [string, string],
  REQ_COMPLETE: ['#0066CC', '#00A3FF'] as [string, string],
  COMPLETE: ['#00A043', '#00C853'] as [string, string],
  CANCEL: ['#DC2626', '#EF4444'] as [string, string],
} as const;

type StatusGradientKey = keyof typeof STATUS_GRADIENTS;

function getStatusGradient(state: string | undefined): [string, string] {
  if (state && state in STATUS_GRADIENTS) {
    return STATUS_GRADIENTS[state as StatusGradientKey];
  }
  return STATUS_GRADIENTS.WRITE;
}

/**
 * 상태 한글명 매핑
 */
const STATUS_NAMES: Record<string, string> = {
  WRITE: '작성',
  ISSUE: '발행',
  PROCESSING: '처리중',
  REQ_COMPLETE: '완료요청',
  COMPLETE: '완료',
  CANCEL: '취소',
};

/**
 * 작업지시 상세 화면
 */
export default function WorkDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workOrderId = parseInt(id || '0', 10);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    addResult,
    isAddingResult,
  } = useWorkOrderDetail({
    workOrderId,
    enabled: !!workOrderId,
  });

  const workOrder = data?.data?.workOrderDTO;

  /**
   * 작업 시작 처리
   */
  const handleStartWork = () => {
    Alert.alert('작업 시작', '작업을 시작하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '시작',
        onPress: () => {
          Alert.alert('알림', '작업이 시작되었습니다.');
        },
      },
    ]);
  };

  /**
   * 완료 요청 처리
   */
  const handleRequestComplete = () => {
    Alert.alert('완료 요청', '작업 완료를 요청하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료 요청',
        onPress: () => {
          if (!workOrder) return;
          addResult({
            workOrderId: workOrder.id,
            content: '작업 완료',
          });
        },
      },
    ]);
  };

  /**
   * 승인 처리
   */
  const handleApprove = () => {
    Alert.alert('승인', '작업 완료를 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: () => {
          Alert.alert('알림', '승인되었습니다.');
        },
      },
    ]);
  };

  /**
   * 반려 처리
   */
  const handleReject = () => {
    Alert.alert('반려', '작업을 반려하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '반려',
        style: 'destructive',
        onPress: () => {
          Alert.alert('알림', '반려되었습니다.');
        },
      },
    ]);
  };

  const statusGradient = getStatusGradient(workOrder?.state);
  const statusName = workOrder?.stateName || STATUS_NAMES[workOrder?.state || 'WRITE'];

  /**
   * 상태에 따른 액션 버튼 렌더링
   */
  const renderActionButtons = useMemo(() => {
    if (!workOrder) return null;

    switch (workOrder.state) {
      case 'ISSUE':
        return (
          <GradientActionButton
            label="작업 시작"
            onPress={handleStartWork}
            gradient={gradients.primary}
          />
        );

      case 'PROCESSING':
        return (
          <GradientActionButton
            label="완료 요청"
            onPress={handleRequestComplete}
            loading={isAddingResult}
            gradient={gradients.accent}
          />
        );

      case 'REQ_COMPLETE':
        return (
          <XStack gap="$3" width="100%">
            <YStack flex={1}>
              <Button
                onPress={handleReject}
                variant="outline"
                fullWidth
                size="lg"
              >
                반려
              </Button>
            </YStack>
            <YStack flex={1}>
              <GradientActionButton
                label="승인"
                onPress={handleApprove}
                gradient={gradients.success}
              />
            </YStack>
          </XStack>
        );

      case 'COMPLETE':
      case 'CANCEL':
      default:
        return null;
    }
  }, [workOrder, isAddingResult]);

  // 로딩 상태
  if (isLoading) {
    return <LoadingOverlay visible message="작업지시 정보를 불러오는 중..." />;
  }

  // 에러 상태
  if (isError || !workOrder) {
    return (
      <YStack flex={1} backgroundColor="$gray50">
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          title="오류 발생"
          description={error?.message || '작업지시 정보를 불러올 수 없습니다.'}
          actionLabel="다시 시도"
          onAction={refetch}
        />
      </YStack>
    );
  }

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
                <Text fontSize={16} color="$white">←</Text>
                <Text fontSize={14} fontWeight="600" color="$white">뒤로</Text>
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

          {/* 작업 제목 */}
          <YStack paddingHorizontal="$5" paddingTop="$2">
            <Text
              fontSize={24}
              fontWeight="800"
              color="$white"
              letterSpacing={-0.5}
              numberOfLines={2}
            >
              {workOrder.name}
            </Text>
            {workOrder.description && (
              <Text
                fontSize={14}
                color="rgba(255, 255, 255, 0.8)"
                marginTop="$2"
                numberOfLines={2}
              >
                {workOrder.description}
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
        {/* 기본 정보 섹션 */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard floating intensity="heavy" marginBottom={16}>
            <SectionHeader title="기본 정보" size="sm" showAccent />
            <YStack gap="$3" marginTop="$2">
              <InfoRow
                label="작업 분류"
                value={
                  workOrder.firstClassName && workOrder.secondClassName
                    ? `${workOrder.firstClassName} > ${workOrder.secondClassName}`
                    : workOrder.firstClassName || workOrder.secondClassName || '-'
                }
              />
              <InfoRow label="빌딩" value={workOrder.buildingName} />
              <InfoRow label="작업 위치" value={workOrder.location} />
              <InfoRow
                label="점검 항목 수"
                value={workOrder.itemSize ? `${workOrder.itemSize}개` : '-'}
                highlight
              />
            </YStack>
          </GlassCard>
        </Animated.View>

        {/* 일정 정보 섹션 */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard intensity="medium" marginBottom={16}>
            <SectionHeader title="일정 정보" size="sm" showAccent />
            <YStack gap="$3" marginTop="$2">
              <InfoRow
                label="계획 시작일"
                value={workOrder.planStartDate}
                highlight
              />
              <InfoRow
                label="계획 종료일"
                value={workOrder.planEndDate}
                highlight
              />
              <InfoRow label="작성일" value={workOrder.writeDate} />
            </YStack>
          </GlassCard>
        </Animated.View>

        {/* 담당 정보 섹션 */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard intensity="medium" marginBottom={16}>
            <SectionHeader title="담당 정보" size="sm" showAccent />
            <YStack gap="$3" marginTop="$2">
              <InfoRow label="작성자" value={workOrder.writerName} />
              <InfoRow label="담당자" value={workOrder.managerName} />
              <InfoRow label="담당자 연락처" value={workOrder.managerPhone} />
            </YStack>
          </GlassCard>
        </Animated.View>

        {/* 첨부 파일 섹션 */}
        {workOrder.attachments && workOrder.attachments.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <GlassCard intensity="light" marginBottom={16}>
              <SectionHeader title="첨부 파일" size="sm" showAccent />
              <AttachmentList attachments={workOrder.attachments} />
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* 액션 버튼 (하단 고정) */}
      {renderActionButtons && (
        <Animated.View entering={FadeInUp.springify()}>
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
            style={Platform.select({
              ios: {
                shadowColor: '#0066CC',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
              },
              android: {
                elevation: 8,
              },
            }) as ViewStyle}
          >
            {renderActionButtons}
          </YStack>
        </Animated.View>
      )}
    </YStack>
  );
}

/**
 * 정보 행 컴포넌트
 */
interface InfoRowProps {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  if (!value) return null;

  return (
    <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
      <Text fontSize={14} color="$gray500" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize={14}
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
        style={Platform.select({
          ios: {
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          },
          android: {
            elevation: 6,
          },
        }) as ViewStyle}
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
