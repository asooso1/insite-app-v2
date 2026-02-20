/**
 * 작업지시 목록 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 필터 + Floating 카드
 * 시니어 모드 지원: 확대된 리스트 아이템, 고대비 배지, 테두리 강조
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { RefreshControl, View, Animated } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';
import { useDebounce } from '@/hooks/useDebounce';
import { WorkOrderCard } from '@/features/work/components/WorkOrderCard';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { GlassSearchInput } from '@/components/ui/GlassSearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { EmptyState } from '@/components/ui/EmptyState';
import type { WorkOrderDTO } from '@/api/generated/models';
import { useGetWorkOrderList } from '@/api/generated/work-order/work-order';
import { useAuthStore } from '@/stores/auth.store';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCardListItem, SeniorStatusBadge } from '@/components/ui/SeniorCard';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';

/**
 * 상태 필터 타입
 */
type WorkOrderStateFilter =
  | 'WRITE'
  | 'ISSUE'
  | 'PROCESSING'
  | 'REQ_COMPLETE'
  | 'COMPLETE'
  | 'CANCEL';

/**
 * 필터 옵션
 */
const FILTER_OPTIONS: { state: WorkOrderStateFilter | null; label: string }[] = [
  { state: null, label: '전체' },
  { state: 'ISSUE', label: '발행' },
  { state: 'PROCESSING', label: '진행중' },
  { state: 'REQ_COMPLETE', label: '완료요청' },
  { state: 'COMPLETE', label: '완료' },
];

/**
 * 작업지시 목록 화면
 */
export default function WorkListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isSeniorMode } = useSeniorStyles();
  const { contentPaddingBottom } = useTabBarHeight();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  // 상태 관리
  const [searchText, setSearchText] = useState('');
  const [selectedState, setSelectedState] = useState<WorkOrderStateFilter | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 디바운스된 검색어 (300ms)
  const debouncedSearch = useDebounce(searchText, 300);

  // buildingId from auth store
  const user = useAuthStore((s) => s.user);
  const buildingId = useMemo(() => {
    const bid =
      user?.selectedBuildingAccountDTO?.buildingId ??
      user?.buildingAccountDTO?.[0]?.buildingId;
    return bid ? Number(bid) : 0;
  }, [user]);

  // API: 작업지시 목록 조회 (서버 keyword 검색, 클라이언트 state 필터)
  const { data: workOrderListData, refetch } = useGetWorkOrderList(
    {
      buildingId,
      searchKeyword: debouncedSearch || undefined,
      page: 0,
      size: 100,
    },
    { query: { enabled: buildingId > 0 } },
  );

  const allWorkOrders = useMemo(
    () => workOrderListData?.data?.content ?? [],
    [workOrderListData],
  );

  // 클라이언트 상태 필터링
  const workOrders = useMemo(() => {
    if (!selectedState) return allWorkOrders;
    return allWorkOrders.filter((item) => item.state === selectedState);
  }, [allWorkOrders, selectedState]);

  // 작업지시 상세로 이동
  const handleWorkOrderPress = useCallback(
    (workOrder: WorkOrderDTO) => {
      router.push(`/(main)/(home)/work/${workOrder.id}` as never);
    },
    [router],
  );

  // Pull to Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // 상태별 카운트
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allWorkOrders.length };
    allWorkOrders.forEach((wo) => {
      const state = wo.state || 'WRITE';
      counts[state] = (counts[state] || 0) + 1;
    });
    return counts;
  }, [allWorkOrders]);

  // 상태 매핑 헬퍼
  const getStatusBadgeProps = (state: string | undefined) => {
    switch (state) {
      case 'COMPLETE':
        return { status: 'completed' as const, label: '완료' };
      case 'PROCESSING':
        return { status: 'inProgress' as const, label: '진행중' };
      case 'REQ_COMPLETE':
        return { status: 'pending' as const, label: '완료요청' };
      case 'ISSUE':
        return { status: 'pending' as const, label: '발행' };
      default:
        return { status: 'pending' as const, label: '대기' };
    }
  };

  // 렌더링 함수
  const renderItem = useCallback(
    ({ item }: { item: WorkOrderDTO; index: number }) => {
      if (isSeniorMode) {
        // 시니어 모드: 리스트 아이템 형태
        const statusProps = getStatusBadgeProps(item.state);
        const subtitle = [item.buildingName, item.writerName].filter(Boolean).join(' · ');
        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <SeniorCardListItem
              title={item.name || '제목 없음'}
              subtitle={subtitle || '상세 정보 없음'}
              right={<SeniorStatusBadge {...statusProps} />}
              onPress={() => handleWorkOrderPress(item)}
            />
          </View>
        );
      }

      // 일반 모드: 기존 카드
      return (
        <View>
          <WorkOrderCard
            workOrder={item}
            onPress={handleWorkOrderPress}
            progress={undefined}
          />
        </View>
      );
    },
    [handleWorkOrderPress, isSeniorMode]
  );

  const renderEmpty = useCallback(() => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
        <EmptyState
          title="작업지시가 없습니다"
          description={
            debouncedSearch || selectedState ? '필터를 변경해보세요' : '새 작업지시를 등록해주세요'
          }
          actionLabel={!debouncedSearch && !selectedState ? '작업지시 등록' : undefined}
          onAction={
            !debouncedSearch && !selectedState ? () => router.push('/work/create') : undefined
          }
        />
      </YStack>
    );
  }, [debouncedSearch, selectedState, router]);

  const renderHeader = useCallback(() => {
    return (
      <YStack>
        {/* 필터 Pills */}
        <View>
          <XStack
            paddingHorizontal="$4"
            paddingTop="$3"
            paddingBottom="$2"
            gap="$2"
            flexWrap="wrap"
          >
            {FILTER_OPTIONS.map(({ state, label }) => {
              const count = state ? stateCounts[state] || 0 : stateCounts.all;
              return (
                <FilterPill
                  key={state || 'all'}
                  label={`${label} ${count}`}
                  selected={selectedState === state}
                  onPress={() => setSelectedState(state)}
                  size="md"
                />
              );
            })}
          </XStack>
        </View>

        {/* 결과 카운트 */}
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$2"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={13} color="$gray500">
            총 {workOrders.length}건
          </Text>
          {(debouncedSearch || selectedState) && (
            <Text
              fontSize={13}
              color="$primary"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                setSearchText('');
                setSelectedState(null);
              }}
            >
              필터 초기화
            </Text>
          )}
        </XStack>
      </YStack>
    );
  }, [selectedState, stateCounts, workOrders.length, debouncedSearch]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="작업지시"
        expandedHeight={160}
        collapsedHeight={80}
        rightAction={
          <YStack
            backgroundColor="$glassWhite20"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={12}
            borderWidth={1}
            borderColor="$glassWhite30"
            pressStyle={{ opacity: 0.8, scale: 0.97 }}
            onPress={() => router.push('/work/create')}
          >
            <Text fontSize={13} fontWeight="700" color="$white">
              + 등록
            </Text>
          </YStack>
        }
        bottomContent={
          <GlassSearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="작업명, 건물, 담당자로 검색"
          />
        }
      />

      {/* 작업지시 목록 */}
      <Animated.FlatList
        data={workOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() ?? ''}
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
          paddingBottom: contentPaddingBottom,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
