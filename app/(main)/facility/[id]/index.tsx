/**
 * 설비 상세 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 카드 섹션
 * 설비 이미지, 사양 정보, 관련 업무 이력 표시 (필터 포함)
 * 시니어 모드 지원: 확대된 텍스트, 테두리 강조, 고대비 배지
 */
import React, { useState } from 'react';
import { ScrollView, Pressable, View, Image, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, styled } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
// Select component not used in this file
import { useFacilityDetail, useFacilityHistory } from '@/features/facility/hooks/useFacilities';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { AppIcon } from '@/components/icons';

/**
 * 상태별 그라디언트 색상
 */
const STATUS_GRADIENTS = {
  NORMAL: ['#00A043', '#00C853'] as [string, string],
  WARNING: ['#FF6B00', '#FFB800'] as [string, string],
  ERROR: ['#DC2626', '#EF4444'] as [string, string],
  MAINTENANCE: ['#0066CC', '#00A3FF'] as [string, string],
} as const;

type StatusGradientKey = keyof typeof STATUS_GRADIENTS;

function getStatusGradient(status: string | undefined): [string, string] {
  if (status && status in STATUS_GRADIENTS) {
    return STATUS_GRADIENTS[status as StatusGradientKey];
  }
  return STATUS_GRADIENTS.NORMAL;
}

/**
 * 상태 한글명 매핑
 */
const STATUS_NAMES: Record<string, string> = {
  NORMAL: '정상',
  WARNING: '주의',
  ERROR: '오류',
  MAINTENANCE: '점검중',
};

const { width: screenWidth } = Dimensions.get('window');

/**
 * 필터 옵션
 */
const WORK_TYPE_OPTIONS = [
  { label: '전체', value: '' },
  { label: '수시업무', value: '1' },
  { label: '수동등록', value: '-1' },
];

const WORK_ORDER_TYPE_OPTIONS = [
  { label: '수시업무', value: '1' },
  { label: '공사업무', value: '2' },
  { label: '고객불편', value: '3' },
  { label: '사건사고', value: '4' },
];

const HISTORY_TYPE_OPTIONS = [
  { label: '전체', value: '' },
  { label: '보수', value: 'REPAIR' },
  { label: '교체', value: 'REPLACEMENT' },
  { label: '점검', value: 'INSPECTION' },
  { label: '청소', value: 'CLEANING' },
];

const WORK_SOURCE_TYPE_OPTIONS = [
  { label: '전체', value: '' },
  { label: '자체', value: 'IN_HOUSE' },
  { label: '외주', value: 'OUTSOURCED' },
];

const SEARCH_TYPE_OPTIONS = [
  { label: '업무명', value: 'work_order_name' },
  { label: '작성자', value: 'writer_account' },
  { label: '처리자', value: 'processing_account' },
  { label: '승인자', value: 'approve_account' },
];

// Styled 컴포넌트
const FilterContainer = styled(YStack, {
  name: 'FilterContainer',
  backgroundColor: '$gray50',
  borderRadius: 12,
  padding: 16,
  marginTop: 12,
  gap: 12,
});

const FilterRow = styled(XStack, {
  name: 'FilterRow',
  gap: 8,
});

const FilterItem = styled(YStack, {
  name: 'FilterItem',
  flex: 1,
});

const FilterLabel = styled(Text, {
  name: 'FilterLabel',
  fontSize: 12,
  color: '$gray500',
  marginBottom: 6,
});

const HistoryItem = styled(YStack, {
  name: 'HistoryItem',
  backgroundColor: '$gray50',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '$gray200',
});

/**
 * 설비 상세 화면
 */
export default function FacilityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const facilityId = parseInt(id || '0', 10);
  const { isSeniorMode, fontSize, colors, card: cardStyles } = useSeniorStyles();

  // 필터 표시 상태
  const [showFilter, setShowFilter] = useState(false);

  // 설비 상세 조회
  const { facility } = useFacilityDetail({
    facilityId,
    useMock: true,
  });

  // 설비 이력 조회
  const {
    historyList,
    filter,
    updateFilter,
    search,
    hasMore,
    loadMore,
    isLoading: historyLoading,
    totalPages,
    page,
  } = useFacilityHistory({
    facilityId,
    buildingId: facility?.buildingId ?? 0,
    useMock: true,
  });

  if (!facility) {
    return (
      <YStack flex={1} backgroundColor="$gray50">
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          title="설비를 찾을 수 없습니다"
          description="설비 정보를 불러올 수 없습니다."
          actionLabel="목록으로"
          onAction={() => router.back()}
        />
      </YStack>
    );
  }

  const statusGradient = getStatusGradient(facility.status);
  const statusName = STATUS_NAMES[facility.status || 'NORMAL'];

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
                gap="$2"
              >
                <Text fontSize={16} color="$white">{'<'}</Text>
                <Text fontSize={isSeniorMode ? fontSize.small : 14} fontWeight="600" color="$white">
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
              <Text fontSize={isSeniorMode ? fontSize.small : 14} fontWeight="700" color="$white">
                {statusName}
              </Text>
            </YStack>
          </XStack>

          {/* 설비명 */}
          <YStack paddingHorizontal="$5" paddingTop="$2">
            <Text
              fontSize={isSeniorMode ? fontSize.title : 24}
              fontWeight="800"
              color="$white"
              letterSpacing={-0.5}
              numberOfLines={2}
            >
              {facility.name}
            </Text>
            {facility.code && (
              <Text
                fontSize={isSeniorMode ? fontSize.small : 14}
                color="rgba(255, 255, 255, 0.8)"
                marginTop="$1"
              >
                {facility.code}
              </Text>
            )}
            {facility.description && (
              <Text
                fontSize={isSeniorMode ? fontSize.small : 14}
                color="rgba(255, 255, 255, 0.8)"
                marginTop="$2"
                numberOfLines={2}
              >
                {facility.description}
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
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 설비 이미지 */}
        {facility.imageUrl && (
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? '$gray300' : '$transparent'}
              borderRadius={16}
            >
              <GlassCard floating intensity="heavy">
                <YStack borderRadius={12} overflow="hidden">
                  <Image
                    source={{ uri: facility.imageUrl }}
                    style={{
                      width: '100%',
                      height: screenWidth * 0.6,
                    }}
                    resizeMode="cover"
                  />
                </YStack>
              </GlassCard>
            </YStack>
          </View>
        )}

        {/* 기본 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : '$transparent'}
            borderRadius={16}
          >
            <GlassCard floating intensity="heavy">
              <SectionHeader title="기본 정보" size="sm" showAccent />
              <YStack gap="$3" marginTop="$2">
                <InfoRow label="설비 유형" value={facility.type} isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow
                  label="분류"
                  value={
                    facility.firstClassName && facility.secondClassName
                      ? `${facility.firstClassName} > ${facility.secondClassName}${
                          facility.thirdClassName ? ` > ${facility.thirdClassName}` : ''
                        }`
                      : facility.firstClassName || facility.secondClassName || '-'
                  }
                  isSeniorMode={isSeniorMode}
                  fontSize={fontSize}
                />
                <InfoRow label="빌딩" value={facility.buildingName} isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow label="층" value={facility.floor} isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow label="위치" value={facility.location} isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow label="제조사" value={facility.manufacturer} highlight isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow label="모델명" value={facility.model} isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow label="용량" value={facility.capacity} highlight isSeniorMode={isSeniorMode} fontSize={fontSize} />
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 사양 정보 섹션 */}
        {facility.specifications && facility.specifications.length > 0 && (
          <View>
            <YStack
              marginBottom={16}
              borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
              borderColor={isSeniorMode ? '$gray300' : '$transparent'}
              borderRadius={16}
            >
              <GlassCard intensity="medium">
                <SectionHeader title="사양 정보" size="sm" showAccent />
                <YStack gap="$3" marginTop="$2">
                  {facility.specifications.map((spec, index) => (
                    <InfoRow
                      key={index}
                      label={spec.name}
                      value={`${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`}
                      isSeniorMode={isSeniorMode}
                      fontSize={fontSize}
                    />
                  ))}
                </YStack>
              </GlassCard>
            </YStack>
          </View>
        )}

        {/* 일정 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : '$transparent'}
            borderRadius={16}
          >
            <GlassCard intensity="medium">
              <SectionHeader title="일정 정보" size="sm" showAccent />
              <YStack gap="$3" marginTop="$2">
                <InfoRow label="설치일" value={facility.installDate} isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow label="최종 점검일" value={facility.lastCheckDate} highlight isSeniorMode={isSeniorMode} fontSize={fontSize} />
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 담당 정보 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : '$transparent'}
            borderRadius={16}
          >
            <GlassCard intensity="medium">
              <SectionHeader title="담당 정보" size="sm" showAccent />
              <YStack gap="$3" marginTop="$2">
                <InfoRow label="담당자" value={facility.managerName} isSeniorMode={isSeniorMode} fontSize={fontSize} />
                <InfoRow label="연락처" value={facility.managerPhone} isSeniorMode={isSeniorMode} fontSize={fontSize} />
              </YStack>
            </GlassCard>
          </YStack>
        </View>

        {/* 설비 이력 섹션 */}
        <View>
          <YStack
            marginBottom={16}
            borderWidth={isSeniorMode ? cardStyles.borderWidth : 0}
            borderColor={isSeniorMode ? '$gray300' : '$transparent'}
            borderRadius={16}
          >
            <GlassCard intensity="light">
              {/* 이력 헤더 */}
              <XStack justifyContent="space-between" alignItems="center">
                <SectionHeader title="설비 이력" size="sm" showAccent />
                <Pressable
                  onPress={() => setShowFilter(!showFilter)}
                  style={{
                    backgroundColor: '#F7F7FA',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <AppIcon name="search" size="sm" color="$gray700" />
                  <Text fontSize={isSeniorMode ? fontSize.small : 14} fontWeight="500" color="$gray900">
                    {showFilter ? '필터 접기' : '필터 열기'}
                  </Text>
                </Pressable>
              </XStack>

              {/* 필터 패널 */}
              {showFilter && (
                <FilterContainer>
                  {/* 업무 구분 */}
                  <FilterRow>
                    <FilterItem>
                      <FilterLabel>업무구분</FilterLabel>
                      <View
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#E6E6E8',
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                        }}
                      >
                        <Text fontSize={14} color="$gray900">
                          {WORK_TYPE_OPTIONS.find((o) => o.value === filter.workType)?.label || '전체'}
                        </Text>
                      </View>
                    </FilterItem>
                  </FilterRow>

                  {/* 수시업무 유형 (업무구분이 '1'일 때) */}
                  {filter.workType === '1' && (
                    <FilterRow>
                      <FilterItem>
                        <FilterLabel>업무 유형</FilterLabel>
                        <View
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#E6E6E8',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                          }}
                        >
                          <Text fontSize={14} color="$gray900">
                            {WORK_ORDER_TYPE_OPTIONS.find((o) => o.value === filter.workOrderType)?.label ||
                              '수시업무'}
                          </Text>
                        </View>
                      </FilterItem>
                    </FilterRow>
                  )}

                  {/* 수동등록 필터 (업무구분이 '-1'일 때) */}
                  {filter.workType === '-1' && (
                    <FilterRow>
                      <FilterItem>
                        <FilterLabel>구분</FilterLabel>
                        <View
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#E6E6E8',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                          }}
                        >
                          <Text fontSize={14} color="$gray900">
                            {HISTORY_TYPE_OPTIONS.find((o) => o.value === filter.historyType)?.label || '전체'}
                          </Text>
                        </View>
                      </FilterItem>
                      <FilterItem>
                        <FilterLabel>유형</FilterLabel>
                        <View
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#E6E6E8',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                          }}
                        >
                          <Text fontSize={14} color="$gray900">
                            {WORK_SOURCE_TYPE_OPTIONS.find((o) => o.value === filter.workSourceType)?.label ||
                              '전체'}
                          </Text>
                        </View>
                      </FilterItem>
                    </FilterRow>
                  )}

                  {/* 검색 */}
                  <FilterRow>
                    <FilterItem>
                      <FilterLabel>검색구분</FilterLabel>
                      <View
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#E6E6E8',
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                        }}
                      >
                        <Text fontSize={14} color="$gray900">
                          {SEARCH_TYPE_OPTIONS.find((o) => o.value === filter.searchType)?.label || '업무명'}
                        </Text>
                      </View>
                    </FilterItem>
                    <FilterItem style={{ flex: 2 }}>
                      <FilterLabel>검색어</FilterLabel>
                      <TextInput
                        value={filter.searchKeyword || ''}
                        onChangeText={(text) => updateFilter({ searchKeyword: text })}
                        placeholder="검색어를 입력하세요"
                        placeholderTextColor="#94A3B8"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#E6E6E8',
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          color: '#0F172A',
                        }}
                      />
                    </FilterItem>
                  </FilterRow>

                  {/* 검색 버튼 */}
                  <Button
                    variant="primary"
                    size={isSeniorMode ? 'senior' : 'md'}
                    fullWidth
                    onPress={search}
                  >
                    검색
                  </Button>
                </FilterContainer>
              )}

              {/* 이력 목록 */}
              <YStack marginTop="$4">
                {historyLoading ? (
                  <YStack padding="$8" alignItems="center">
                    <ActivityIndicator size="large" color={colors.primary} />
                  </YStack>
                ) : historyList.length > 0 ? (
                  <>
                    {historyList.map((item, index) => (
                      <HistoryItem key={`${item.id}-${index}`}>
                        <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                          <Text fontSize={isSeniorMode ? fontSize.small : 14} color="$gray500" fontWeight="500">
                            No {index + 1}
                          </Text>
                          <YStack
                            backgroundColor="#E8F3FF"
                            paddingHorizontal="$3"
                            paddingVertical="$1"
                            borderRadius={12}
                          >
                            <Text
                              fontSize={isSeniorMode ? fontSize.small : 12}
                              fontWeight="600"
                              color="$primary"
                            >
                              {item.type || '점검'}
                            </Text>
                          </YStack>
                        </XStack>
                        <XStack justifyContent="space-between" alignItems="center">
                          <Text
                            fontSize={isSeniorMode ? fontSize.medium : 16}
                            fontWeight="600"
                            color="$gray900"
                            flex={1}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text fontSize={isSeniorMode ? fontSize.small : 13} color="$gray500">
                            {item.actorAccountName}
                          </Text>
                        </XStack>
                        <Text
                          fontSize={isSeniorMode ? fontSize.small : 13}
                          color="$gray500"
                          marginTop="$1"
                        >
                          {item.doneDate}
                        </Text>
                        {item.description && (
                          <Text
                            fontSize={isSeniorMode ? fontSize.small : 14}
                            color="$gray700"
                            marginTop="$2"
                            lineHeight={isSeniorMode ? 28 : 20}
                          >
                            {item.description}
                          </Text>
                        )}
                      </HistoryItem>
                    ))}

                    {/* 더보기 버튼 */}
                    {hasMore && (
                      <Pressable
                        onPress={loadMore}
                        style={{
                          height: 44,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: colors.primary,
                        }}
                      >
                        <Text fontSize={isSeniorMode ? fontSize.medium : 16} fontWeight="600" color="$primary">
                          더보기
                        </Text>
                      </Pressable>
                    )}

                    {/* 페이지 정보 */}
                    {totalPages > 0 && (
                      <Text
                        fontSize={isSeniorMode ? fontSize.small : 12}
                        color="$gray500"
                        textAlign="center"
                        marginTop="$2"
                      >
                        {page + 1} / {totalPages} 페이지
                      </Text>
                    )}
                  </>
                ) : (
                  <Text
                    fontSize={isSeniorMode ? fontSize.small : 14}
                    color="$gray500"
                    textAlign="center"
                    paddingVertical="$8"
                  >
                    검색결과가 없습니다.
                  </Text>
                )}
              </YStack>
            </GlassCard>
          </YStack>
        </View>
      </ScrollView>

      {/* 확인 버튼 */}
      <YStack
        paddingHorizontal="$4"
        paddingVertical="$4"
        paddingBottom={insets.bottom + 16}
        backgroundColor="$white"
        borderTopWidth={1}
        borderTopColor="$gray200"
      >
        <Button
          variant="primary"
          size={isSeniorMode ? 'senior' : 'lg'}
          fullWidth
          onPress={() => router.back()}
        >
          확인
        </Button>
      </YStack>
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
  isSeniorMode: boolean;
  fontSize: { small: number; medium: number };
}

function InfoRow({ label, value, highlight = false, isSeniorMode, fontSize }: InfoRowProps) {
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
