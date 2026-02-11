/**
 * 일상업무 상세 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 카드 섹션
 * v1 참조: 이미지 갤러리, 업무 대상 정보, 확인/수정 버튼 (권한별)
 * 시니어 모드 지원: 확대된 텍스트, 테두리 강조, 고대비 배지
 */
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Alert,
  Platform,
  ViewStyle,
  Pressable,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { getMockPersonalTaskDetail } from '@/features/personal-task/utils/mockData';
import type { PersonalTaskDetailDTO, ImageInfo } from '@/features/personal-task/types';
import { gradients } from '@/theme/tokens';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 상태별 그라디언트 색상
 */
const STATUS_GRADIENTS = {
  UNCONFIRMED: ['#FF6B00', '#FFB800'] as [string, string], // 미확인 - 오렌지
  CONFIRMED: ['#00A043', '#00C853'] as [string, string], // 확인완료 - 그린
} as const;

type StatusGradientKey = keyof typeof STATUS_GRADIENTS;

function getStatusGradient(status: string): [string, string] {
  if (status in STATUS_GRADIENTS) {
    return STATUS_GRADIENTS[status as StatusGradientKey];
  }
  return STATUS_GRADIENTS.UNCONFIRMED;
}

/**
 * 상태 한글명 매핑
 */
const STATUS_NAMES: Record<string, string> = {
  UNCONFIRMED: '미확인',
  CONFIRMED: '확인완료',
};

/**
 * Mock 현재 사용자 정보 (실제로는 auth store에서 가져옴)
 */
const MOCK_CURRENT_USER = {
  id: 201, // 확인자 ID와 동일하게 설정하여 승인 버튼 표시
  roleId: 1, // 1: 관리자, 3: 팀장, 9: 그룹장, 19: 일반
  name: '이영희',
};

/**
 * 일상업무 상세 화면
 */
export default function PersonalTaskDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { isSeniorMode, card: cardStyles } = useSeniorStyles();

  // Mock 데이터에서 찾기 (실제로는 API 사용)
  const task = useMemo<PersonalTaskDetailDTO | undefined>(() => {
    return getMockPersonalTaskDetail(taskId);
  }, [taskId]);

  // 이미지 모달 상태
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  /**
   * 확인(승인) 처리
   */
  const handleConfirm = () => {
    Alert.alert('확인', '이 업무를 확인 처리하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: () => {
          // TODO: API 호출
          Alert.alert('알림', '확인 처리되었습니다.', [
            {
              text: '확인',
              onPress: () => router.back(),
            },
          ]);
        },
      },
    ]);
  };

  /**
   * 수정 화면으로 이동
   */
  const handleEdit = () => {
    // TODO: 수정 화면으로 이동
    Alert.alert('알림', '수정 화면은 준비 중입니다.');
  };

  /**
   * 권한 체크: 수정 가능 여부 (작성자 본인만)
   */
  const canEdit = useMemo(() => {
    if (!task || task.status === 'CONFIRMED') return false;
    return MOCK_CURRENT_USER.id === task.writerInfo?.id;
  }, [task]);

  /**
   * 권한 체크: 확인(승인) 가능 여부 (확인자 또는 관리자)
   */
  const canConfirm = useMemo(() => {
    if (!task || task.status === 'CONFIRMED') return false;
    // 확인자 본인이거나 관리자 권한
    return (
      MOCK_CURRENT_USER.id === task.confirmInfo?.id ||
      MOCK_CURRENT_USER.roleId === 1
    );
  }, [task]);

  const statusGradient = task ? getStatusGradient(task.status) : STATUS_GRADIENTS.UNCONFIRMED;
  const statusName = task
    ? task.statusName || STATUS_NAMES[task.status]
    : STATUS_NAMES.UNCONFIRMED;

  /**
   * 하단 액션 버튼 렌더링
   */
  const renderActionButtons = useMemo(() => {
    if (!task || task.status === 'CONFIRMED') return null;

    const hasActions = canEdit || canConfirm;
    if (!hasActions) return null;

    return (
      <XStack gap="$3" width="100%">
        {/* 수정 버튼 */}
        {canEdit && (
          <YStack flex={1}>
            <Button onPress={handleEdit} variant="outline" fullWidth size="lg">
              수정
            </Button>
          </YStack>
        )}

        {/* 승인 버튼 */}
        {canConfirm && (
          <YStack flex={1}>
            <GradientActionButton
              label="승인하기"
              onPress={handleConfirm}
              gradient={gradients.success}
            />
          </YStack>
        )}
      </XStack>
    );
  }, [task, canEdit, canConfirm]);

  // 데이터 없음
  if (!task) {
    return (
      <YStack flex={1} backgroundColor="$gray50">
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          title="일상업무를 찾을 수 없습니다"
          description="삭제되었거나 존재하지 않는 업무입니다."
          actionLabel="목록으로"
          onAction={() => router.back()}
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
                <Text fontSize={16} color="$white">
                  {'<-'}
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

          {/* 제목 */}
          <YStack paddingHorizontal="$5" paddingTop="$2">
            <Text
              fontSize={isSeniorMode ? 28 : 24}
              fontWeight="800"
              color="$white"
              letterSpacing={-0.5}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.scheduleStartDate && (
              <Text fontSize={14} color="rgba(255, 255, 255, 0.8)" marginTop="$2">
                일정: {task.scheduleStartDate}
                {task.scheduleEndDate && task.scheduleEndDate !== task.scheduleStartDate
                  ? ` ~ ${task.scheduleEndDate}`
                  : ''}
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
          paddingBottom: renderActionButtons ? 140 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 업무 대상 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard floating intensity="heavy">
              <SectionHeader title="업무 대상 정보" size="sm" showAccent />
              <YStack gap="$3" marginTop="$2">
                <InfoRow
                  label="대상 건물"
                  value={
                    task.baseArea && task.buildingName
                      ? `${task.baseArea} > ${task.buildingName}`
                      : task.buildingName || '-'
                  }
                />
                <InfoRow label="담당팀" value={task.teamName} />
                <InfoRow
                  label="등록자"
                  value={
                    task.writerInfo
                      ? `${task.writerInfo.name}(${task.writerInfo.companyName || ''} | ${task.writerInfo.role || ''})`
                      : task.writerName
                  }
                />
                <InfoRow
                  label="확인자"
                  value={
                    task.confirmInfo
                      ? `${task.confirmInfo.confirmAccountName}(${task.confirmInfo.companyName || ''} | ${task.confirmInfo.role || ''})`
                      : task.confirmedByName
                  }
                />
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 업무 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="medium">
              <SectionHeader title="업무 정보" size="sm" showAccent />
              <YStack gap="$3" marginTop="$2">
                <InfoRow label="업무 구분" value={task.type || '일상업무'} />
                <InfoRow label="업무 내용" value={task.description || task.content} multiline />
                <InfoRow label="위치 정보" value={task.location} />
                <InfoRow
                  label="등록일"
                  value={task.writerInfo?.writeDate || task.createdAt}
                />
                <InfoRow label="설비명" value={task.facilityName} />
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 확인 정보 섹션 (확인완료 상태일 때만) */}
        {task.status === 'CONFIRMED' && task.confirmedAt && (
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? '$gray300' : undefined}
              borderRadius={16}
            >
              <GlassCard intensity="light">
                <SectionHeader title="확인 정보" size="sm" showAccent />
                <YStack gap="$3" marginTop="$2">
                  <InfoRow label="확인자" value={task.confirmedByName} highlight />
                  <InfoRow label="확인일시" value={task.confirmedAt} highlight />
                </YStack>
              </GlassCard>
            </YStack>
          </View>
        )}

        {/* 이미지 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : undefined}
            borderRadius={16}
          >
            <GlassCard intensity="light">
              <SectionHeader title="이미지" size="sm" showAccent />
              <ImageGallery
                images={task.images || []}
                onImagePress={setSelectedImage}
                emptyText="이미지가 없습니다"
              />
            </GlassCard>
          </YStack>
        </View>
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
                  shadowColor: '#00A043',
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

      {/* 이미지 모달 */}
      <ImageModal
        visible={selectedImage !== null}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
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
  multiline?: boolean;
}

function InfoRow({ label, value, highlight = false, multiline = false }: InfoRowProps) {
  const { isSeniorMode, fontSize } = useSeniorStyles();

  if (!value) return null;

  if (multiline) {
    return (
      <YStack gap="$2">
        <Text fontSize={isSeniorMode ? fontSize.small : 14} color="$gray500">
          {label}
        </Text>
        <Text
          fontSize={isSeniorMode ? fontSize.medium : 14}
          color="$gray900"
          fontWeight="500"
          lineHeight={isSeniorMode ? 28 : 22}
        >
          {value}
        </Text>
      </YStack>
    );
  }

  return (
    <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
      <Text fontSize={isSeniorMode ? fontSize.small : 14} color="$gray500" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize={isSeniorMode ? fontSize.medium : 14}
        color={highlight ? '$success' : '$gray900'}
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
 * 이미지 갤러리 컴포넌트
 */
interface ImageGalleryProps {
  images: ImageInfo[];
  onImagePress: (url: string) => void;
  emptyText?: string;
}

function ImageGallery({ images, onImagePress, emptyText = '이미지가 없습니다' }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <YStack
        marginTop="$3"
        paddingVertical="$6"
        alignItems="center"
        justifyContent="center"
        backgroundColor="$gray50"
        borderRadius={12}
      >
        <Text fontSize={14} color="$gray400">
          {emptyText}
        </Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 12 }}
      contentContainerStyle={{ gap: 12 }}
    >
      {images.map((image, index) => (
        <Pressable
          key={image.id || index}
          onPress={() => onImagePress(image.imageUrl)}
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#E6E6E8',
          }}
        >
          <View
            style={{
              width: 200,
              height: 150,
              backgroundColor: '#F7F7FA',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* 실제 이미지 로드 (Mock은 placeholder) */}
            <Text fontSize={12} color="$gray400">
              이미지 {index + 1}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/**
 * 이미지 모달 컴포넌트
 */
interface ImageModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

function ImageModal({ visible, imageUrl, onClose }: ImageModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        {/* 닫기 버튼 */}
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 60,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>X</Text>
        </Pressable>

        {/* 이미지 (Mock placeholder) */}
        <View
          style={{
            width: SCREEN_WIDTH - 40,
            height: SCREEN_HEIGHT * 0.6,
            backgroundColor: '#333',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#999', fontSize: 16 }}>
            {imageUrl ? '이미지 로딩 중...' : '이미지 없음'}
          </Text>
        </View>
      </Pressable>
    </Modal>
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
