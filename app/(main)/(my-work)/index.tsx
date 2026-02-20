/**
 * 내 작업 화면
 *
 * 작업지시 목록 화면과 동일한 UI/UX 사용
 * 2026 Modern UI - 그라디언트 헤더 + Glass 필터 + Floating 카드
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
import type { TaskDTO, WorkOrderDTO } from '@/api/generated/models';
import { GetTaskListType } from '@/api/generated/models/getTaskListType';
import { TaskDTOType } from '@/api/generated/models/taskDTOType';
import { useGetTaskList } from '@/api/generated/tasks/tasks';
import { useAuthStore } from '@/stores/auth.store';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCardListItem, SeniorStatusBadge } from '@/components/ui/SeniorCard';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';

/**
 * TaskDTO → WorkOrderDTO 호환 매핑
 * WorkOrderCard 재사용을 위한 어댑터
 */
function taskToWorkOrder(task: TaskDTO): WorkOrderDTO {
  return {
    id: task.id,
    name: task.name,
    state: task.state as WorkOrderDTO['state'],
    stateName: task.stateName ?? '',
    buildingName: task.buildingName,
    writerName: task.managerName,
    planStartDate: task.planStartDate,
    planEndDate: task.planEndDate,
    firstClassName: task.typeName,
  };
}

/**
 * TaskDTO type에 따른 상세 경로 반환
 */
function getTaskDetailRoute(task: TaskDTO): string {
  switch (task.type) {
    case TaskDTOType.WORK_ORDER:
      return `/(main)/(home)/work/${task.id}`;
    case TaskDTOType.PATROL:
      return `/(main)/(home)/patrol/${task.id}`;
    case TaskDTOType.PERSONAL:
      return `/(main)/(home)/personal-task/${task.id}`;
    case TaskDTOType.COMPLAIN:
      return `/(main)/(home)/claim/${task.id}`;
    default:
      return `/(main)/(home)/work/${task.id}`;
  }
}

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
 * 내 작업 화면
 */
export default function MyWorkScreen() {
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

  // API: 내 업무 목록 조회
  const { data: taskListData, refetch } = useGetTaskList(
    { type: GetTaskListType.own, buildingId, page: 0, size: 100 },
    { query: { enabled: buildingId > 0 } },
  );

  const allTasks = useMemo(() => taskListData?.data?.content ?? [], [taskListData]);

  // 클라이언트 필터링 (API에 state/keyword 필터 없음)
  const filteredTasks = useMemo(() => {
    let filtered = allTasks;

    // 검색 필터
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.buildingName?.toLowerCase().includes(searchLower) ||
          item.managerName?.toLowerCase().includes(searchLower),
      );
    }

    // 상태 필터
    if (selectedState) {
      filtered = filtered.filter((item) => item.state === selectedState);
    }

    return filtered;
  }, [allTasks, debouncedSearch, selectedState]);

  // 작업 상세로 이동 (타입별 라우팅)
  const handleTaskPress = useCallback(
    (task: TaskDTO) => {
      router.push(getTaskDetailRoute(task) as never);
    },
    [router],
  );

  // WorkOrderCard용 핸들러 (WorkOrderDTO → TaskDTO 매핑)
  const handleWorkOrderCardPress = useCallback(
    (workOrder: WorkOrderDTO) => {
      const task = allTasks.find((t) => t.id === workOrder.id);
      if (task) handleTaskPress(task);
    },
    [allTasks, handleTaskPress],
  );

  // Pull to Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // 상태별 카운트
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allTasks.length };
    allTasks.forEach((task) => {
      const state = task.state || 'WRITE';
      counts[state] = (counts[state] || 0) + 1;
    });
    return counts;
  }, [allTasks]);

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
    ({ item }: { item: TaskDTO }) => {
      if (isSeniorMode) {
        // 시니어 모드: 리스트 아이템 형태
        const statusProps = getStatusBadgeProps(item.state);
        const subtitle = [item.typeName, item.buildingName, item.managerName]
          .filter(Boolean)
          .join(' · ');
        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <SeniorCardListItem
              title={item.name || '제목 없음'}
              subtitle={subtitle || '상세 정보 없음'}
              right={<SeniorStatusBadge {...statusProps} />}
              onPress={() => handleTaskPress(item)}
            />
          </View>
        );
      }

      // 일반 모드: WorkOrderCard 재사용 (TaskDTO → WorkOrderDTO 매핑)
      const workOrderCompat = taskToWorkOrder(item);
      return (
        <View>
          <WorkOrderCard
            workOrder={workOrderCompat}
            onPress={handleWorkOrderCardPress}
          />
        </View>
      );
    },
    [handleTaskPress, handleWorkOrderCardPress, isSeniorMode],
  );

  const renderEmpty = useCallback(() => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
        <EmptyState
          title="배정된 작업이 없습니다"
          description={
            debouncedSearch || selectedState
              ? '필터를 변경해보세요'
              : '새 작업이 배정되면 여기에 표시됩니다'
          }
        />
      </YStack>
    );
  }, [debouncedSearch, selectedState]);

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
            총 {filteredTasks.length}건
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
  }, [selectedState, stateCounts, filteredTasks.length, debouncedSearch]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="내 작업"
        expandedHeight={160}
        collapsedHeight={80}
        bottomContent={
          <GlassSearchInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="작업명, 건물, 담당자로 검색"
          />
        }
      />

      {/* 작업 목록 */}
      <Animated.FlatList
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
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
