/**
 * 고객불편(VOC) 목록 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glass 필터 + Floating 카드
 * 기간 필터: 당일/3일/7일/한달
 * 검색 옵션: 전체/제목/내용/전화번호
 * 시니어 모드 지원: 확대된 리스트 아이템, 고대비 배지, 테두리 강조
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { RefreshControl, View, Pressable, Animated } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDebounce } from '@/hooks/useDebounce';
import { ClaimCard } from '@/features/claim/components/ClaimCard';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { GlassSearchInput } from '@/components/ui/GlassSearchInput';
import { FilterPill } from '@/components/ui/FilterPill';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ClaimDTO, ClaimState, SearchOption } from '@/features/claim/types';
import { mockClaims } from '@/features/claim/utils/mockData';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCardListItem, SeniorStatusBadge } from '@/components/ui/SeniorCard';
import { PERIOD_FILTER_OPTIONS, getPeriodDates, type PeriodFilter } from '@/features/claim/hooks';

/**
 * 필터 옵션
 */
const STATE_FILTER_OPTIONS: { state: ClaimState | null; label: string }[] = [
  { state: null, label: '전체' },
  { state: 'RECEIVED', label: '접수' },
  { state: 'PROCESSING', label: '처리중' },
  { state: 'COMPLETED', label: '완료' },
  { state: 'REJECTED', label: '반려' },
];

const SEARCH_OPTIONS: { option: SearchOption; label: string }[] = [
  { option: 'ALL', label: '전체' },
  { option: 'TITLE', label: '제목' },
  { option: 'CONTENT', label: '내용' },
  { option: 'PHONE', label: '전화번호' },
];

/**
 * 고객불편 목록 화면
 */
export default function ClaimListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isSeniorMode } = useSeniorStyles();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  // 상태 관리
  const [searchText, setSearchText] = useState('');
  const [selectedState, setSelectedState] = useState<ClaimState | null>(null);
  const [searchOption, setSearchOption] = useState<SearchOption>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('3day');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 디바운스된 검색어 (300ms)
  const debouncedSearch = useDebounce(searchText, 300);

  // Mock 데이터 필터링 (실제로는 API 사용)
  const claims = useMemo(() => {
    let filtered = [...mockClaims];

    // 검색 필터
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((item) => {
        switch (searchOption) {
          case 'TITLE':
            return item.title.toLowerCase().includes(searchLower);
          case 'CONTENT':
            return item.content.toLowerCase().includes(searchLower);
          case 'PHONE':
            return item.phoneNumber?.includes(searchLower);
          case 'ALL':
          default:
            return (
              item.title.toLowerCase().includes(searchLower) ||
              item.content.toLowerCase().includes(searchLower) ||
              item.phoneNumber?.includes(searchLower)
            );
        }
      });
    }

    // 상태 필터
    if (selectedState) {
      filtered = filtered.filter((item) => item.state === selectedState);
    }

    return filtered;
  }, [debouncedSearch, selectedState, searchOption]);

  // 고객불편 상세로 이동
  const handleClaimPress = useCallback(
    (claim: ClaimDTO) => {
      router.push(`/claim/${claim.id}`);
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

  // 상태별 카운트
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockClaims.length };
    mockClaims.forEach((claim) => {
      counts[claim.state] = (counts[claim.state] || 0) + 1;
    });
    return counts;
  }, []);

  // 기간 필터 날짜 문자열
  const periodDateString = useMemo(() => {
    const { from, to } = getPeriodDates(selectedPeriod);
    if (from === to) {
      return from;
    }
    return `${from} ~ ${to}`;
  }, [selectedPeriod]);

  // 상태 매핑 헬퍼
  const getStatusBadgeProps = (state: ClaimState) => {
    switch (state) {
      case 'COMPLETED':
        return { status: 'completed' as const, label: '완료' };
      case 'PROCESSING':
        return { status: 'inProgress' as const, label: '처리중' };
      case 'RECEIVED':
        return { status: 'pending' as const, label: '접수' };
      case 'REJECTED':
        return { status: 'error' as const, label: '반려' };
      default:
        return { status: 'pending' as const, label: '접수' };
    }
  };

  // 렌더링 함수
  const renderItem = useCallback(
    ({ item }: { item: ClaimDTO; index: number }) => {
      if (isSeniorMode) {
        // 시니어 모드: 리스트 아이템 형태
        const statusProps = getStatusBadgeProps(item.state);
        const subtitle = [item.buildingName, item.floor, item.phoneNumber].filter(Boolean).join(' · ');
        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <SeniorCardListItem
              title={item.title}
              subtitle={subtitle || '상세 정보 없음'}
              right={<SeniorStatusBadge {...statusProps} />}
              onPress={() => handleClaimPress(item)}
            />
          </View>
        );
      }

      // 일반 모드: 카드
      return (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <ClaimCard claim={item} onPress={handleClaimPress} />
        </View>
      );
    },
    [handleClaimPress, isSeniorMode]
  );

  const renderEmpty = useCallback(() => {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
        <EmptyState
          title="고객불편이 없습니다"
          description={
            debouncedSearch || selectedState ? '필터를 변경해보세요' : '새 고객불편을 등록해주세요'
          }
          actionLabel={!debouncedSearch && !selectedState ? '고객불편 등록' : undefined}
          onAction={
            !debouncedSearch && !selectedState ? () => router.push('/claim/create') : undefined
          }
        />
      </YStack>
    );
  }, [debouncedSearch, selectedState, router]);

  const renderHeader = useCallback(() => {
    return (
      <YStack>
        {/* 기간 필터 Pills */}
        <View>
          <XStack
            paddingHorizontal="$4"
            paddingTop="$3"
            paddingBottom="$2"
            gap="$2"
          >
            {PERIOD_FILTER_OPTIONS.map(({ value, label }) => (
              <Pressable
                key={value}
                onPress={() => setSelectedPeriod(value)}
                style={{ flex: 1 }}
              >
                <YStack
                  backgroundColor={selectedPeriod === value ? '$primaryLight' : '$surface'}
                  paddingVertical="$2.5"
                  borderRadius={10}
                  borderWidth={1}
                  borderColor={selectedPeriod === value ? '$primary' : '$gray200'}
                  alignItems="center"
                >
                  <Text
                    fontSize={isSeniorMode ? 16 : 14}
                    fontWeight="600"
                    color={selectedPeriod === value ? '$primary' : '$gray600'}
                  >
                    {label}
                  </Text>
                </YStack>
              </Pressable>
            ))}
          </XStack>
        </View>

        {/* 기간 표시 배지 */}
        <XStack
          marginHorizontal="$4"
          marginTop="$1"
          marginBottom="$2"
          backgroundColor="$primaryLight"
          paddingVertical="$1.5"
          paddingHorizontal="$3"
          borderRadius={8}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={12} fontWeight="600" color="$primary">
            {periodDateString}
          </Text>
        </XStack>

        {/* 검색 옵션 Pills (검색어 입력 시 표시) */}
        {searchText.length > 0 && (
          <XStack
            paddingHorizontal="$4"
            paddingTop="$2"
            paddingBottom="$2"
            gap="$2"
            flexWrap="wrap"
          >
            {SEARCH_OPTIONS.map(({ option, label }) => (
              <FilterPill
                key={option}
                label={label}
                selected={searchOption === option}
                onPress={() => setSearchOption(option)}
                size="sm"
              />
            ))}
          </XStack>
        )}

        {/* 상태 필터 Pills */}
        <View>
          <XStack
            paddingHorizontal="$4"
            paddingTop="$2"
            paddingBottom="$2"
            gap="$2"
            flexWrap="wrap"
          >
            {STATE_FILTER_OPTIONS.map(({ state, label }) => {
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
            총 {claims.length}건
          </Text>
          {(debouncedSearch || selectedState || selectedPeriod !== '3day') && (
            <Text
              fontSize={13}
              color="$primary"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                setSearchText('');
                setSelectedState(null);
                setSearchOption('ALL');
                setSelectedPeriod('3day');
              }}
            >
              필터 초기화
            </Text>
          )}
        </XStack>
      </YStack>
    );
  }, [selectedState, stateCounts, claims.length, debouncedSearch, searchText, searchOption, selectedPeriod, periodDateString, isSeniorMode]);

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="고객불편"
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
            onPress={() => router.push('/claim/create')}
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
            placeholder="제목, 내용, 전화번호로 검색"
          />
        }
      />

      {/* 고객불편 목록 */}
      <Animated.FlatList
        data={claims}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent?.val}
            colors={[theme.accent?.val || '#FF6B00']}
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
