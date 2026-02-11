/**
 * 설비 목록 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 필터 + Floating 카드
 * 3단계 카테고리 필터 (대분류 > 중분류 > 소분류)
 * 시니어 모드 지원: 확대된 리스트 아이템, 고대비 배지, 테두리 강조
 */
import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View, Pressable, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDebounce } from '@/hooks/useDebounce';
import { FacilityCard } from '@/features/facility/components/FacilityCard';
import { CategoryFilter, CategorySelectorButton } from '@/features/facility/components/CategoryFilter';
import { useFacilities } from '@/features/facility/hooks/useFacilities';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { GlassSearchInput } from '@/components/ui/GlassSearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { EmptyState } from '@/components/ui/EmptyState';
// GlassCard not used in this file
import type { FacilityDTO, SelectedCategories } from '@/features/facility/types';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCardListItem, SeniorStatusBadge } from '@/components/ui/SeniorCard';
import { AppIcon } from '@/components/icons';

/**
 * 상태 필터 타입
 */
type FacilityStatusFilter = 'NORMAL' | 'WARNING' | 'ERROR' | 'MAINTENANCE';

/**
 * 필터 옵션
 */
const FILTER_OPTIONS: { status: FacilityStatusFilter | null; label: string }[] = [
  { status: null, label: '전체' },
  { status: 'NORMAL', label: '정상' },
  { status: 'WARNING', label: '주의' },
  { status: 'ERROR', label: '오류' },
  { status: 'MAINTENANCE', label: '점검중' },
];

/**
 * 설비 목록 화면
 */
export default function FacilityListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isSeniorMode, fontSize } = useSeniorStyles();

  // 상태 관리
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FacilityStatusFilter | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryText, setCategoryText] = useState('');

  // 디바운스된 검색어 (300ms)
  const debouncedSearch = useDebounce(searchText, 300);

  // 설비 목록 훅
  const {
    allFacilities,
    totalPages,
    currentPage,
    isLoading,
    selectedCategories,
    firstCategories,
    secondCategories,
    thirdCategories,
    categoriesLoading,
    handleFirstCategoryChange,
    handleSecondCategoryChange,
    applyCategories,
    setKeyword,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  } = useFacilities({ useMock: true });

  // 검색어 적용
  React.useEffect(() => {
    setKeyword(debouncedSearch);
  }, [debouncedSearch, setKeyword]);

  // 필터링된 목록
  const filteredFacilities = useMemo(() => {
    let filtered = [...allFacilities];

    // 상태 필터
    if (selectedStatus) {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    return filtered;
  }, [allFacilities, selectedStatus]);

  // 설비 상세로 이동
  const handleFacilityPress = useCallback(
    (facility: FacilityDTO) => {
      router.push(`/facility/${facility.id}`);
    },
    [router]
  );

  // Pull to Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TODO: 실제 refetch 호출
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  }, []);

  // 카테고리 선택 완료
  const handleCategoryConfirm = useCallback(
    (selected: SelectedCategories, text: string) => {
      applyCategories(selected);
      setCategoryText(text);
    },
    [applyCategories]
  );

  // 상태별 카운트
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allFacilities.length };
    allFacilities.forEach((facility) => {
      counts[facility.status || 'NORMAL'] = (counts[facility.status || 'NORMAL'] || 0) + 1;
    });
    return counts;
  }, [allFacilities]);

  // 상태 매핑 헬퍼
  const getStatusBadgeProps = (status: string | undefined) => {
    switch (status) {
      case 'NORMAL':
        return { status: 'completed' as const, label: '정상' };
      case 'WARNING':
        return { status: 'pending' as const, label: '주의' };
      case 'ERROR':
        return { status: 'error' as const, label: '오류' };
      case 'MAINTENANCE':
        return { status: 'inProgress' as const, label: '점검중' };
      default:
        return { status: 'completed' as const, label: '정상' };
    }
  };

  // 렌더링 함수
  const renderItem = useCallback(
    ({ item }: { item: FacilityDTO; index: number }) => {
      if (isSeniorMode) {
        // 시니어 모드: 리스트 아이템 형태
        const statusProps = getStatusBadgeProps(item.status);
        const subtitle = [item.buildingName, item.floor, item.location]
          .filter(Boolean)
          .join(' / ');
        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <SeniorCardListItem
              title={item.name || '제목 없음'}
              subtitle={subtitle || '위치 정보 없음'}
              right={<SeniorStatusBadge {...statusProps} />}
              onPress={() => handleFacilityPress(item)}
            />
          </View>
        );
      }

      // 일반 모드: 기존 카드
      return (
        <View>
          <FacilityCard facility={item} onPress={handleFacilityPress} />
        </View>
      );
    },
    [handleFacilityPress, isSeniorMode]
  );

  const renderEmpty = useCallback(() => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
        <EmptyState
          title="설비가 없습니다"
          description={
            debouncedSearch || selectedStatus || categoryText
              ? '필터를 변경해보세요'
              : '등록된 설비가 없습니다'
          }
        />
      </YStack>
    );
  }, [debouncedSearch, selectedStatus, categoryText]);

  const renderHeader = useCallback(() => {
    return (
      <YStack>
        {/* 카테고리 선택 버튼 */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <CategorySelectorButton
            categoryText={categoryText}
            onPress={() => setCategoryModalVisible(true)}
          />
        </View>

        {/* 필터 Pills */}
        <View>
          <XStack
            paddingHorizontal="$4"
            paddingTop="$2"
            paddingBottom="$2"
            gap="$2"
            flexWrap="wrap"
          >
            {FILTER_OPTIONS.map(({ status, label }) => {
              const count = status ? statusCounts[status] || 0 : statusCounts.all;
              return (
                <FilterPill
                  key={status || 'all'}
                  label={`${label} ${count}`}
                  selected={selectedStatus === status}
                  onPress={() => setSelectedStatus(status)}
                  size="md"
                />
              );
            })}
          </XStack>
        </View>

        {/* 결과 카운트 + 페이지 정보 */}
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$2"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={isSeniorMode ? fontSize.small : 13} color="$gray500">
            총 {filteredFacilities.length}건
            {totalPages > 1 && ` (${currentPage + 1}/${totalPages} 페이지)`}
          </Text>
          {(debouncedSearch || selectedStatus || categoryText) && (
            <Text
              fontSize={isSeniorMode ? fontSize.small : 13}
              color="$primary"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                setSearchText('');
                setSelectedStatus(null);
                setCategoryText('');
                applyCategories({
                  firstCategoryId: 0,
                  secondCategoryId: 0,
                  thirdCategoryId: 0,
                });
              }}
            >
              필터 초기화
            </Text>
          )}
        </XStack>

        {/* 도움말 */}
        <XStack paddingHorizontal="$4" paddingBottom="$2" alignItems="center" gap="$2">
          <AppIcon name="info" size="sm" color="$gray400" />
          <Text fontSize={isSeniorMode ? fontSize.small : 13} color="$gray400">
            리스트를 클릭하면 상세정보를 확인할 수 있습니다.
          </Text>
        </XStack>
      </YStack>
    );
  }, [
    selectedStatus,
    statusCounts,
    filteredFacilities.length,
    debouncedSearch,
    categoryText,
    totalPages,
    currentPage,
    isSeniorMode,
    fontSize,
    applyCategories,
  ]);

  // 페이지네이션 렌더링
  const renderPagination = useCallback(() => {
    if (totalPages <= 1) return null;

    return (
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        justifyContent="center"
        alignItems="center"
        backgroundColor="$white"
        borderTopWidth={1}
        borderTopColor="$gray200"
        gap="$2"
      >
        <Pressable
          onPress={firstPage}
          disabled={currentPage === 0}
          style={{ padding: 8, opacity: currentPage === 0 ? 0.3 : 1 }}
        >
          <Text fontSize={16} color="$gray700">{'<<'}</Text>
        </Pressable>
        <Pressable
          onPress={prevPage}
          disabled={currentPage === 0}
          style={{ padding: 8, opacity: currentPage === 0 ? 0.3 : 1 }}
        >
          <Text fontSize={16} color="$gray700">{'<'}</Text>
        </Pressable>

        <XStack alignItems="center" gap="$1" paddingHorizontal="$3">
          <Text fontSize={isSeniorMode ? fontSize.medium : 16} fontWeight="700" color="$primary">
            {currentPage + 1}
          </Text>
          <Text fontSize={isSeniorMode ? fontSize.medium : 16} color="$gray500">
            /
          </Text>
          <Text fontSize={isSeniorMode ? fontSize.medium : 16} color="$gray500">
            {totalPages}
          </Text>
        </XStack>

        <Pressable
          onPress={nextPage}
          disabled={currentPage >= totalPages - 1}
          style={{ padding: 8, opacity: currentPage >= totalPages - 1 ? 0.3 : 1 }}
        >
          <Text fontSize={16} color="$gray700">{'>'}</Text>
        </Pressable>
        <Pressable
          onPress={lastPage}
          disabled={currentPage >= totalPages - 1}
          style={{ padding: 8, opacity: currentPage >= totalPages - 1 ? 0.3 : 1 }}
        >
          <Text fontSize={16} color="$gray700">{'>>'}</Text>
        </Pressable>
      </XStack>
    );
  }, [totalPages, currentPage, firstPage, prevPage, nextPage, lastPage, isSeniorMode, fontSize]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* 그라디언트 헤더 */}
      <GradientHeader
        title="설비 정보"
        height={160}
        bottomContent={
          <GlassSearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="설비명, 코드, 위치, 제조사로 검색"
          />
        }
      />

      {/* 로딩 상태 */}
      {isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={theme.primary.val} />
        </YStack>
      ) : (
        <>
          {/* 설비 목록 */}
          <FlatList
            data={filteredFacilities}
            renderItem={renderItem}
            keyExtractor={(item) => item.id?.toString() ?? ''}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.primary.val}
                colors={[theme.primary.val]}
                progressViewOffset={-20}
              />
            }
            contentContainerStyle={{
              paddingBottom: totalPages > 1 ? 80 : insets.bottom + 20,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          />

          {/* 페이지네이션 */}
          {renderPagination()}
        </>
      )}

      {/* 카테고리 필터 모달 */}
      <CategoryFilter
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onConfirm={handleCategoryConfirm}
        firstCategories={firstCategories}
        secondCategories={secondCategories}
        thirdCategories={thirdCategories}
        onFirstCategoryChange={handleFirstCategoryChange}
        onSecondCategoryChange={handleSecondCategoryChange}
        initialSelection={selectedCategories}
        loading={categoriesLoading}
      />
    </YStack>
  );
}
