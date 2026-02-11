/**
 * 승인/확인 목록 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 필터 + Floating 카드
 * 시니어 모드 지원: 확대된 리스트 아이템, 고대비 배지, 테두리 강조
 *
 * v1 기능 (ApprovalList.js 참조):
 * - 탭: 금일업무 / 지연업무
 * - 선택 모드: 체크박스로 다중 선택
 * - 전체 선택 / 해제
 * - 일괄 확인 버튼 (플로팅)
 * - 업무 타입별 색상 (수시-블루, 순찰-그린, 긴급-레드, 정기-퍼플, 일상-오렌지)
 * - 미확인만 보기 토글
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { RefreshControl, View, Alert, Animated } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, CheckCircle, X } from '@tamagui/lucide-icons';
import { useDebounce } from '@/hooks/useDebounce';
import { ApprovalCard } from '@/features/approval/components/ApprovalCard';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { GlassSearchInput } from '@/components/ui/GlassSearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import type { ApprovalItemDTO, ApprovalType } from '@/features/approval/types';
import { mockApprovalItems } from '@/features/approval/utils/mockData';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCardListItem, SeniorStatusBadge } from '@/components/ui/SeniorCard';

/**
 * 탭 타입
 */
type TabType = 'today' | 'delayed';

/**
 * 타입별 색상 (v1 참조)
 * - 수시: 블루
 * - 순찰: 그린
 * - 긴급: 레드
 * - 정기: 퍼플
 * - 일상: 오렌지
 */
const _TYPE_COLORS: Record<ApprovalType, { bg: string; text: string }> = {
  WORK: { bg: '#0066CC', text: '#FFFFFF' }, // 작업지시 - 블루
  PATROL: { bg: '#00A043', text: '#FFFFFF' }, // 순찰 - 그린
  EMERGENCY: { bg: '#DC2626', text: '#FFFFFF' }, // 긴급 - 레드
  REGULAR: { bg: '#9333EA', text: '#FFFFFF' }, // 정기 - 퍼플
  ADHOC: { bg: '#0066CC', text: '#FFFFFF' }, // 수시 - 블루
  DAILY: { bg: '#FF6B00', text: '#FFFFFF' }, // 일상 - 오렌지
};
// 타입 컬러는 ApprovalCard에서 사용됨 (여기서는 참조용 상수)
void _TYPE_COLORS;

/**
 * 승인/확인 목록 화면
 */
export default function ApprovalListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isSeniorMode } = useSeniorStyles();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  // 상태 관리
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // 디바운스된 검색어 (300ms)
  const debouncedSearch = useDebounce(searchText, 300);

  // Mock 데이터 필터링
  const { todayItems, delayedItems, todayPendingCount, delayedCount } = useMemo(() => {
    const today = '2026-02-10'; // 실제로는 new Date().toISOString().split('T')[0]

    // 오늘 업무
    let todayFiltered = mockApprovalItems.filter((item) => {
      const itemDate = item.completedDate || item.createdDate;
      return itemDate === today;
    });

    // 미확인만 보기 적용
    if (showPendingOnly) {
      todayFiltered = todayFiltered.filter((item) => item.status === 'PENDING');
    }

    // 지연 업무 (과거)
    const delayedFiltered = mockApprovalItems.filter((item) => {
      const itemDate = item.completedDate || item.createdDate;
      return itemDate < today && item.status === 'PENDING';
    });

    // 오늘 미확인 건수 (필터 적용 전)
    const todayPending = mockApprovalItems.filter((item) => {
      const itemDate = item.completedDate || item.createdDate;
      return itemDate === today && item.status === 'PENDING';
    }).length;

    return {
      todayItems: todayFiltered,
      delayedItems: delayedFiltered,
      todayPendingCount: todayPending,
      delayedCount: delayedFiltered.length,
    };
  }, [showPendingOnly]);

  // 현재 탭 아이템
  const currentItems = useMemo(() => {
    const items = activeTab === 'today' ? todayItems : delayedItems;

    // 검색 필터
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.buildingName?.toLowerCase().includes(searchLower) ||
          item.writerName?.toLowerCase().includes(searchLower)
      );
    }

    return items;
  }, [activeTab, todayItems, delayedItems, debouncedSearch]);

  // 선택 가능한 항목 (순찰 제외, 미확인만)
  const selectableItems = useMemo(() => {
    return currentItems.filter((item) => item.status === 'PENDING' && item.type !== 'PATROL');
  }, [currentItems]);

  // 전체 선택 여부
  const isAllSelected = useMemo(() => {
    if (selectableItems.length === 0) return false;
    return selectableItems.every((item) => selectedIds.has(item.id));
  }, [selectableItems, selectedIds]);

  // 항목 클릭
  const handleItemPress = useCallback(
    (item: ApprovalItemDTO) => {
      if (selectionMode) {
        // 선택 모드일 때는 토글
        if (item.status === 'PENDING' && item.type !== 'PATROL') {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(item.id)) {
              next.delete(item.id);
            } else {
              next.add(item.id);
            }
            return next;
          });
        }
      } else {
        // 일반 모드일 때는 상세로 이동
        if (
          item.type === 'WORK' ||
          item.type === 'ADHOC' ||
          item.type === 'REGULAR' ||
          item.type === 'EMERGENCY'
        ) {
          router.push(`/work/${item.id}`);
        } else if (item.type === 'PATROL') {
          router.push(`/patrol/${item.id}`);
        } else if (item.type === 'DAILY') {
          // 일상업무 상세 (TODO: 구현 필요)
          router.push(`/work/${item.id}`);
        }
      }
    },
    [router, selectionMode]
  );

  // 선택 토글
  const handleToggleSelect = useCallback((item: ApprovalItemDTO) => {
    if (item.status !== 'PENDING' || item.type === 'PATROL') return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  }, []);

  // 전체 선택/해제
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableItems.map((item) => item.id)));
    }
  }, [isAllSelected, selectableItems]);

  // 선택 모드 종료
  const handleExitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  // 일괄 확인
  const handleBatchApprove = useCallback(async () => {
    if (selectedIds.size === 0) return;

    Alert.alert('확인', `${selectedIds.size}개 항목을 확인 처리하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          setIsApproving(true);
          try {
            // TODO: 실제 API 호출
            await new Promise((resolve) => setTimeout(resolve, 1000));
            Alert.alert('완료', `${selectedIds.size}개 항목이 확인 처리되었습니다.`);
            setSelectedIds(new Set());
            setSelectionMode(false);
          } catch (error) {
            Alert.alert('오류', '확인 처리 중 오류가 발생했습니다.');
          } finally {
            setIsApproving(false);
          }
        },
      },
    ]);
  }, [selectedIds.size]);

  // Pull to Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TODO: 실제 refetch 호출
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  }, []);

  // 탭 변경
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
  }, []);

  // 상태 매핑 헬퍼
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { status: 'completed' as const, label: '승인완료' };
      case 'REJECTED':
        return { status: 'error' as const, label: '반려' };
      case 'PENDING':
      default:
        return { status: 'pending' as const, label: '승인요청' };
    }
  };

  // 렌더링 함수
  const renderItem = useCallback(
    ({ item }: { item: ApprovalItemDTO }) => {
      const isSelected = selectedIds.has(item.id);

      if (isSeniorMode) {
        // 시니어 모드: 리스트 아이템 형태
        const statusProps = getStatusBadgeProps(item.status);
        const subtitle = [item.typeName, item.buildingName, item.writerName]
          .filter(Boolean)
          .join(' / ');

        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <SeniorCardListItem
              title={item.title}
              subtitle={subtitle}
              right={<SeniorStatusBadge {...statusProps} />}
              onPress={() => handleItemPress(item)}
            />
          </View>
        );
      }

      // 일반 모드: 카드
      return (
        <ApprovalCard
          item={item}
          onPress={handleItemPress}
          selectionMode={selectionMode}
          selected={isSelected}
          onToggleSelect={handleToggleSelect}
        />
      );
    },
    [handleItemPress, handleToggleSelect, isSeniorMode, selectionMode, selectedIds]
  );

  const renderEmpty = useCallback(() => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
        <EmptyState
          title="확인할 항목이 없습니다"
          description={
            debouncedSearch
              ? '검색 조건을 변경해보세요'
              : activeTab === 'today'
                ? '오늘 확인할 업무가 없습니다'
                : '지연된 업무가 없습니다'
          }
        />
      </YStack>
    );
  }, [debouncedSearch, activeTab]);

  const renderHeader = useCallback(() => {
    return (
      <YStack>
        {/* 탭 버튼 (v1 스타일) */}
        <XStack backgroundColor="$white" paddingHorizontal="$5">
          <YStack
            flex={1}
            paddingVertical="$5"
            borderBottomWidth={2}
            borderBottomColor={activeTab === 'today' ? '$primary' : 'transparent'}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => handleTabChange('today')}
          >
            <Text
              fontSize={18}
              fontWeight={activeTab === 'today' ? '600' : '500'}
              color={activeTab === 'today' ? '$primary' : '$gray400'}
              textAlign="center"
            >
              금일업무 {todayPendingCount}건
            </Text>
          </YStack>
          <YStack
            flex={1}
            paddingVertical="$5"
            borderBottomWidth={2}
            borderBottomColor={activeTab === 'delayed' ? '$primary' : 'transparent'}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => handleTabChange('delayed')}
          >
            <Text
              fontSize={18}
              fontWeight={activeTab === 'delayed' ? '600' : '500'}
              color={activeTab === 'delayed' ? '$primary' : '$gray400'}
              textAlign="center"
            >
              지연업무 {delayedCount}건
            </Text>
          </YStack>
        </XStack>

        {/* 액션 헤더 (v1 스타일) */}
        <YStack
          backgroundColor="$white"
          borderBottomWidth={1}
          borderBottomColor="$gray200"
          paddingVertical="$3"
        >
          {/* 상단: 선택 모드 토글 + 미확인만 보기 */}
          <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
            {/* 왼쪽 액션 버튼들 */}
            <XStack gap="$2">
              {/* 선택 모드 토글 */}
              <XStack
                backgroundColor={selectionMode ? '$primaryMuted' : '$gray100'}
                paddingVertical="$2"
                paddingHorizontal="$3"
                borderRadius={8}
                gap="$1.5"
                alignItems="center"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => {
                  if (selectionMode) {
                    handleExitSelectionMode();
                  } else {
                    setSelectionMode(true);
                  }
                }}
              >
                {selectionMode ? (
                  <X size={18} color="$error" />
                ) : (
                  <CheckCircle size={18} color="$gray500" />
                )}
                <Text fontSize={14} fontWeight="600" color={selectionMode ? '$error' : '$gray600'}>
                  {selectionMode ? '선택 모드 종료' : '선택 모드'}
                </Text>
              </XStack>

              {/* 미확인만 보기 (금일업무 탭에서만) */}
              {activeTab === 'today' && (
                <XStack
                  backgroundColor={showPendingOnly ? '$primaryMuted' : '$gray100'}
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  borderRadius={8}
                  gap="$1.5"
                  alignItems="center"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={() => setShowPendingOnly(!showPendingOnly)}
                >
                  <CheckCircle size={18} color={showPendingOnly ? '$primary' : '$gray500'} />
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={showPendingOnly ? '$primary' : '$gray600'}
                  >
                    미승인만 보기
                  </Text>
                </XStack>
              )}
            </XStack>
          </XStack>

          {/* 선택 모드일 때 전체 선택 + 카운트 */}
          {selectionMode && (
            <YStack
              marginTop="$3"
              paddingHorizontal="$4"
              paddingTop="$3"
              borderTopWidth={1}
              borderTopColor="$gray200"
            >
              <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                {/* 전체 선택 버튼 */}
                <XStack
                  gap="$2"
                  alignItems="center"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={handleSelectAll}
                >
                  <YStack
                    width={24}
                    height={24}
                    borderRadius={12}
                    borderWidth={2}
                    borderColor={isAllSelected ? '$primary' : '$gray300'}
                    backgroundColor={isAllSelected ? '$primary' : 'transparent'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {isAllSelected && <Check size={14} color="$white" />}
                  </YStack>
                  <Text fontSize={15} fontWeight="600" color="$gray800">
                    전체 선택
                  </Text>
                </XStack>

                {/* 선택 카운트 */}
                <Text fontSize={14} fontWeight="500" color="$gray500">
                  {selectedIds.size}개 선택됨 / {selectableItems.length}개
                </Text>
              </XStack>

              {/* 확인 버튼 */}
              <XStack
                backgroundColor={selectedIds.size > 0 ? '$primary' : '$gray300'}
                paddingVertical="$3.5"
                borderRadius={12}
                alignItems="center"
                justifyContent="center"
                gap="$2"
                opacity={selectedIds.size > 0 ? 1 : 0.6}
                pressStyle={selectedIds.size > 0 ? { opacity: 0.9, scale: 0.99 } : undefined}
                onPress={selectedIds.size > 0 ? handleBatchApprove : undefined}
              >
                <CheckCircle size={20} color="$white" />
                <Text fontSize={15} fontWeight="600" color="$white">
                  {selectedIds.size > 0 ? `${selectedIds.size}개 승인하기` : '승인하기'}
                </Text>
              </XStack>
            </YStack>
          )}
        </YStack>
      </YStack>
    );
  }, [
    activeTab,
    todayPendingCount,
    delayedCount,
    selectionMode,
    showPendingOnly,
    isAllSelected,
    selectedIds.size,
    selectableItems.length,
    handleTabChange,
    handleExitSelectionMode,
    handleSelectAll,
    handleBatchApprove,
  ]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* 승인 처리 중 로딩 오버레이 */}
      {isApproving && <LoadingOverlay visible message="승인 처리 중..." />}

      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="승인/확인"
        expandedHeight={160}
        collapsedHeight={80}
        bottomContent={
          <GlassSearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="제목, 건물, 담당자로 검색"
          />
        }
      />

      {/* 승인 목록 */}
      <Animated.FlatList
        data={currentItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
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
          paddingBottom: insets.bottom + 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
