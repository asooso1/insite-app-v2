/**
 * 일상업무 목록 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 필터 + Floating 카드
 * v1 참조: 날짜 네비게이션, 팀 필터링, 무한스크롤
 * 시니어 모드 지원: 확대된 리스트 아이템, 고대비 배지, 테두리 강조
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { RefreshControl, View, Pressable, Animated } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';
import { useDebounce } from '@/hooks/useDebounce';
import { PersonalTaskCard } from '@/features/personal-task/components/PersonalTaskCard';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { GlassSearchInput } from '@/components/ui/GlassSearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import type { PersonalTaskDTO, TeamInfo } from '@/features/personal-task/types';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCardListItem, SeniorStatusBadge } from '@/components/ui/SeniorCard';
import { usePersonalTasksInfinite } from '@/features/personal-task/hooks';
import { useAuthStore } from '@/stores/auth.store';
import type { PersonalWorkOrderDTO } from '@/api/generated/models';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';

/**
 * 상태 필터 타입
 */
type PersonalTaskStatusFilter = 'UNCONFIRMED' | 'CONFIRMED';

/**
 * 필터 옵션
 */
const FILTER_OPTIONS: { status: PersonalTaskStatusFilter | null; label: string }[] = [
  { status: null, label: '전체' },
  { status: 'UNCONFIRMED', label: '미확인' },
  { status: 'CONFIRMED', label: '확인완료' },
];

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜 파싱 (YYYY-MM-DD)
 */
function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(year, month, day);
}

/**
 * 일상업무 목록 화면
 */
export default function PersonalTaskListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isSeniorMode } = useSeniorStyles();
  const { contentPaddingBottom } = useTabBarHeight();

  // 빌딩 ID (auth store에서 가져옴)
  const selectedBuilding = useAuthStore((s) => s.user?.selectedBuildingAccountDTO);
  const buildingId = Number(selectedBuilding?.buildingId) || 1;

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  // 상태 관리
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PersonalTaskStatusFilter | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamInfo>({ id: '', name: '전체 팀' });
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // 디바운스된 검색어 (300ms)
  const debouncedSearch = useDebounce(searchText, 300);

  /**
   * 이전 날짜로 이동
   */
  const goToPreviousDay = useCallback(() => {
    const current = parseDate(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(formatDate(current));
  }, [selectedDate]);

  /**
   * 다음 날짜로 이동
   */
  const goToNextDay = useCallback(() => {
    const current = parseDate(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(formatDate(current));
  }, [selectedDate]);

  /**
   * 오늘 날짜로 이동
   */
  const goToToday = useCallback(() => {
    setSelectedDate(formatDate(new Date()));
  }, []);

  // 실제 API 호출 (무한 스크롤)
  const {
    data: apiData,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = usePersonalTasksInfinite({
    date: selectedDate,
    teamId: selectedTeam.id ? Number(selectedTeam.id) : undefined,
    size: 20,
    buildingId,
  });

  // API 응답 → PersonalTaskDTO 변환 및 클라이언트 필터링
  const tasks = useMemo<PersonalTaskDTO[]>(() => {
    const allItems: PersonalWorkOrderDTO[] =
      apiData?.pages.flatMap((page) => page.data?.content ?? []) ?? [];

    return allItems
      .map((item) => ({
        id: item.id,
        title: item.taskName,
        status: item.state === 'CONFIRMED' ? ('CONFIRMED' as const) : ('UNCONFIRMED' as const),
        scheduleStartDate: item.taskDate,
        assigneeName: item.accountName,
        teamName: item.teamName,
        buildingName: item.buildingName,
      }))
      .filter((item) => {
        // 상태 필터 (클라이언트 사이드)
        if (selectedStatus && item.status !== selectedStatus) return false;
        // 검색 필터 (클라이언트 사이드)
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();
          return (
            item.title.toLowerCase().includes(searchLower) ||
            item.assigneeName?.toLowerCase().includes(searchLower) ||
            item.teamName?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });
  }, [apiData, selectedStatus, debouncedSearch]);

  // 일상업무 상세로 이동
  const handleTaskPress = useCallback(
    (task: PersonalTaskDTO) => {
      router.push(`/(main)/(home)/personal-task/${task.id}`);
    },
    [router]
  );

  // Pull to Refresh
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // 상태별 카운트 (현재 표시 데이터 기준)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tasks.length };
    tasks.forEach((task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  // 상태 매핑 헬퍼
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { status: 'completed' as const, label: '확인완료' };
      case 'UNCONFIRMED':
        return { status: 'pending' as const, label: '미확인' };
      default:
        return { status: 'pending' as const, label: '미확인' };
    }
  };

  // 렌더링 함수
  const renderItem = useCallback(
    ({ item }: { item: PersonalTaskDTO; index: number }) => {
      if (isSeniorMode) {
        // 시니어 모드: 리스트 아이템 형태
        const statusProps = getStatusBadgeProps(item.status);
        const subtitle = [item.teamName, item.assigneeName].filter(Boolean).join(' · ');
        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <SeniorCardListItem
              title={item.title}
              subtitle={subtitle || '상세 정보 없음'}
              right={<SeniorStatusBadge {...statusProps} />}
              onPress={() => handleTaskPress(item)}
            />
          </View>
        );
      }

      // 일반 모드: 기존 카드
      return (
        <View>
          <PersonalTaskCard task={item} onPress={handleTaskPress} />
        </View>
      );
    },
    [handleTaskPress, isSeniorMode]
  );

  const renderEmpty = useCallback(() => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
        <EmptyState
          title="일상업무가 없습니다"
          description={
            debouncedSearch || selectedStatus || selectedTeam.id
              ? '필터를 변경해보세요'
              : '새 일상업무를 등록해주세요'
          }
          actionLabel={
            !debouncedSearch && !selectedStatus && !selectedTeam.id ? '일상업무 등록' : undefined
          }
          onAction={
            !debouncedSearch && !selectedStatus && !selectedTeam.id
              ? () => router.push('/(main)/(home)/personal-task/create')
              : undefined
          }
        />
      </YStack>
    );
  }, [debouncedSearch, selectedStatus, selectedTeam, router]);

  const renderHeader = useCallback(() => {
    const isToday = selectedDate === formatDate(new Date());

    return (
      <YStack>
        {/* 날짜 네비게이션 */}
        <XStack
          backgroundColor="$surface"
          paddingVertical="$3"
          paddingHorizontal="$4"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$gray100"
        >
          <Pressable
            onPress={goToPreviousDay}
            style={{
              padding: 12,
              minWidth: 48,
              alignItems: 'center',
            }}
          >
            <Text fontSize={20} color="$gray700" fontWeight="600">
              {'<'}
            </Text>
          </Pressable>

          <Pressable
            onPress={goToToday}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: isToday ? 'rgba(255, 107, 0, 0.1)' : 'transparent',
              borderRadius: 12,
              minWidth: 160,
              alignItems: 'center',
            }}
          >
            <Text
              fontSize={isSeniorMode ? 20 : 16}
              fontWeight="700"
              color={isToday ? '#FF6B00' : '#0F172A'}
            >
              {selectedDate}
            </Text>
            {isToday && (
              <Text fontSize={12} color="#FF6B00" marginTop="$1">
                오늘
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={goToNextDay}
            style={{
              padding: 12,
              minWidth: 48,
              alignItems: 'center',
            }}
          >
            <Text fontSize={20} color="$gray700" fontWeight="600">
              {'>'}
            </Text>
          </Pressable>
        </XStack>

        {/* 팀 필터 (관리자 권한) */}
        <XStack
          backgroundColor="$surface"
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderBottomWidth={1}
          borderBottomColor="$gray100"
          justifyContent="flex-end"
        >
          <Select
            options={[{ label: '전체 팀', value: '' }]}
            value={selectedTeam.id.toString()}
            onChange={(value: string) => {
              setSelectedTeam({ id: value, name: value ? value : '전체 팀' });
            }}
            placeholder="팀 선택"
            size={isSeniorMode ? 'lg' : 'md'}
          />
        </XStack>

        {/* 상태 필터 Pills */}
        <View>
          <XStack
            paddingHorizontal="$4"
            paddingTop="$3"
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

        {/* 결과 카운트 */}
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$2"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={13} color="$gray500">
            총 {tasks.length}건
          </Text>
          {(debouncedSearch || selectedStatus || selectedTeam.id) && (
            <Text
              fontSize={13}
              color="#FF6B00"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                setSearchText('');
                setSelectedStatus(null);
                setSelectedTeam({ id: '', name: '전체 팀' });
              }}
            >
              필터 초기화
            </Text>
          )}
        </XStack>
      </YStack>
    );
  }, [
    selectedDate,
    selectedStatus,
    selectedTeam,
    statusCounts,
    tasks.length,
    debouncedSearch,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    isSeniorMode,
  ]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="일상업무"
        expandedHeight={160}
        collapsedHeight={80}
        variant="accent"
        rightAction={
          <YStack
            backgroundColor="$glassWhite20"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={12}
            borderWidth={1}
            borderColor="$glassWhite30"
            pressStyle={{ opacity: 0.8, scale: 0.97 }}
            onPress={() => router.push('/(main)/(home)/personal-task/create')}
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
            placeholder="제목, 내용, 담당자, 팀으로 검색"
          />
        }
      />

      {/* 일상업무 목록 */}
      <Animated.FlatList
        data={tasks}
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
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.accent?.val}
            colors={[theme.accent?.val || '#FF6B00']}
            progressViewOffset={-20}
          />
        }
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{
          paddingBottom: contentPaddingBottom,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
