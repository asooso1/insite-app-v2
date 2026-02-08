/**
 * 작업지시 목록 화면
 */
import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, Pressable } from 'react-native';
import { YStack, XStack, Text, Input } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDebounce } from '@/hooks/useDebounce';
import { WorkOrderCard } from '@/features/work/components/WorkOrderCard';
import type { WorkOrderDTO } from '@/api/generated/models';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockWorkOrders } from '@/features/work/utils/mockData';

/**
 * 상태 필터 타입
 */
type WorkOrderStateFilter = 'WRITE' | 'ISSUE' | 'PROCESSING' | 'REQ_COMPLETE' | 'COMPLETE' | 'CANCEL';

/**
 * 작업지시 목록 화면
 */
export default function WorkListScreen() {
  const router = useRouter();

  // 상태 관리
  const [searchText, setSearchText] = useState('');
  const [selectedStates, setSelectedStates] = useState<WorkOrderStateFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 디바운스된 검색어 (300ms)
  const debouncedSearch = useDebounce(searchText, 300);

  // TODO: 실제 API 연동 (useWorkOrdersInfinite 사용)
  // const {
  //   data,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  //   refetch,
  //   isRefetching,
  //   isLoading,
  // } = useWorkOrdersInfinite({
  //   buildingId: 1, // 실제 사용자의 buildingId 사용
  //   state: selectedStates.length > 0 ? selectedStates.join(',') : undefined,
  //   searchKeyword: debouncedSearch || undefined,
  //   size: 10,
  // });

  // Mock 데이터 사용 (개발용)
  const workOrders = useMemo(() => {
    let filtered = [...mockWorkOrders];

    // 검색 필터
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.buildingName?.toLowerCase().includes(searchLower) ||
          item.writerName?.toLowerCase().includes(searchLower)
      );
    }

    // 상태 필터
    if (selectedStates.length > 0) {
      filtered = filtered.filter((item) => selectedStates.includes(item.state as WorkOrderStateFilter));
    }

    return filtered;
  }, [debouncedSearch, selectedStates]);

  // 상태 필터 토글
  const handleStateToggle = useCallback((state: WorkOrderStateFilter) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  }, []);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    setSelectedStates([]);
  }, []);

  // 작업지시 상세로 이동
  const handleWorkOrderPress = useCallback(
    (workOrder: WorkOrderDTO) => {
      router.push(`/work/${workOrder.id}`);
    },
    [router]
  );

  // Pull to Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TODO: 실제 refetch 호출
    // await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  // 렌더링 함수
  const renderItem = useCallback(
    ({ item }: { item: WorkOrderDTO }) => (
      <WorkOrderCard workOrder={item} onPress={handleWorkOrderPress} />
    ),
    [handleWorkOrderPress]
  );

  const renderEmpty = useCallback(() => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
        <Text fontSize={16} color="$gray500" textAlign="center">
          작업지시가 없습니다
        </Text>
        {(debouncedSearch || selectedStates.length > 0) && (
          <Text fontSize={14} color="$gray400" marginTop="$2" textAlign="center">
            필터를 변경해보세요
          </Text>
        )}
      </YStack>
    );
  }, [debouncedSearch, selectedStates]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>
      <YStack flex={1}>
        {/* 헤더 */}
        <YStack
          backgroundColor="$white"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="$gray200"
        >
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Text fontSize={24} fontWeight="700" color="$gray900">
              작업지시
            </Text>
            <Button
              variant="primary"
              size="sm"
              onPress={() => router.push('/work/create')}
            >
              + 작업지시 등록
            </Button>
          </XStack>

          {/* 검색 입력 */}
          <Input
            placeholder="작업명, 건물, 담당자로 검색"
            value={searchText}
            onChangeText={setSearchText}
            backgroundColor="$gray50"
            borderColor="$gray200"
            borderWidth={1}
            borderRadius="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
            fontSize={15}
            height={44}
          />

          {/* 필터 토글 버튼 */}
          <XStack marginTop="$3" justifyContent="space-between" alignItems="center">
            <Button
              variant="outline"
              size="sm"
              onPress={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '필터 숨기기' : '필터 보기'}
            </Button>

            {selectedStates.length > 0 && (
              <Button variant="ghost" size="sm" onPress={handleResetFilters}>
                초기화
              </Button>
            )}
          </XStack>
        </YStack>

        {/* 상태 필터 */}
        {showFilters && (
          <YStack backgroundColor="$white" paddingHorizontal="$4" paddingVertical="$3">
            <Text fontSize={14} fontWeight="600" color="$gray700" marginBottom="$2">
              상태
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {(
                [
                  { state: 'WRITE' as const, label: '작성' },
                  { state: 'ISSUE' as const, label: '발행' },
                  { state: 'PROCESSING' as const, label: '처리중' },
                  { state: 'REQ_COMPLETE' as const, label: '완료요청' },
                  { state: 'COMPLETE' as const, label: '완료' },
                  { state: 'CANCEL' as const, label: '취소' },
                ]
              ).map(({ state, label }) => {
                const isSelected = selectedStates.includes(state);
                return (
                  <Pressable key={state} onPress={() => handleStateToggle(state)}>
                    <Badge
                      variant={isSelected ? 'primary' : 'default'}
                      size="md"
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                    >
                      {label}
                    </Badge>
                  </Pressable>
                );
              })}
            </XStack>
          </YStack>
        )}

        {/* 작업지시 목록 */}
        <FlatList
          data={workOrders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() ?? ''}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#0066CC"
            />
          }
          contentContainerStyle={{
            paddingVertical: 8,
            flexGrow: 1,
          }}
        />
      </YStack>
    </SafeAreaView>
  );
}
