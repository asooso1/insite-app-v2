/**
 * 작업지시 상세 화면
 *
 * 작업지시의 상세 정보를 표시하고 상태에 따른 액션 버튼 제공
 */
import React, { useMemo } from 'react';
import { ScrollView, Alert } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { EmptyState } from '@/components/ui/EmptyState';
import { WorkOrderDetail } from '@/features/work/components/WorkOrderDetail';
import { AttachmentList } from '@/features/work/components/AttachmentList';
import { useWorkOrderDetail } from '@/features/work/hooks/useWorkOrderDetail';

/**
 * 작업지시 상세 화면
 */
export default function WorkDetailScreen() {
  const router = useRouter();
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
          // TODO: 작업 시작 API 호출
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
            // TODO: 실제 작업 결과 데이터 수집
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
          // TODO: 승인 API 호출
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
        onPress: () => {
          // TODO: 반려 API 호출
          Alert.alert('알림', '반려되었습니다.');
        },
      },
    ]);
  };

  /**
   * 상태에 따른 액션 버튼 렌더링
   */
  const renderActionButtons = useMemo(() => {
    if (!workOrder) return null;

    switch (workOrder.state) {
      case 'ISSUE': // 발행됨
        return (
          <Button
            onPress={handleStartWork}
            fullWidth
            size="lg"
          >
            작업 시작
          </Button>
        );

      case 'PROCESSING': // 처리중
        return (
          <Button
            onPress={handleRequestComplete}
            loading={isAddingResult}
            fullWidth
            size="lg"
          >
            완료 요청
          </Button>
        );

      case 'REQ_COMPLETE': // 완료요청 (승인자용)
        return (
          <XStack gap="$3" width="100%">
            <YStack flex={1}>
              <Button onPress={handleReject} variant="outline" fullWidth size="lg">
                반려
              </Button>
            </YStack>
            <YStack flex={1}>
              <Button onPress={handleApprove} fullWidth size="lg">
                승인
              </Button>
            </YStack>
          </XStack>
        );

      case 'COMPLETE': // 완료
      case 'CANCEL': // 취소
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
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        edges={['top']}
      >
        <EmptyState
          title="오류 발생"
          description={
            error?.message || '작업지시 정보를 불러올 수 없습니다.'
          }
          actionLabel="다시 시도"
          onAction={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#F8F9FA' }}
      edges={['top']}
    >
      <YStack flex={1}>
        {/* 헤더 */}
        <XStack
          padding="$4"
          backgroundColor="$white"
          borderBottomWidth={1}
          borderBottomColor="$gray200"
          alignItems="center"
          gap="$3"
        >
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            ← 뒤로
          </Button>
          <Text fontSize={18} fontWeight="700" color="$gray900" flex={1}>
            작업지시 상세
          </Text>
        </XStack>

        {/* 스크롤 가능한 콘텐츠 */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: renderActionButtons ? 100 : 16,
          }}
        >
          <YStack gap="$4">
            {/* 상세 정보 */}
            <WorkOrderDetail workOrder={workOrder} />

            {/* 첨부 파일 */}
            <AttachmentList attachments={workOrder.attachments} />
          </YStack>
        </ScrollView>

        {/* 액션 버튼 (하단 고정) */}
        {renderActionButtons && (
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            padding="$4"
            backgroundColor="$white"
            borderTopWidth={1}
            borderTopColor="$gray200"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: -2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={4}
          >
            {renderActionButtons}
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
}
