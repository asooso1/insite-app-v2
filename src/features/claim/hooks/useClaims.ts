/**
 * 고객불편 목록 조회 Hook
 *
 * API 훅과 Mock 데이터 간 전환 가능
 */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type {
  ComplainListResponse,
  GetComplainListParams,
  GetComplainListState,
} from '@/api/generated/models';
import { getComplainList, getGetComplainListQueryKey } from '@/api/generated/complain/complain';
import { mockClaims } from '../utils/mockData';
import type { ClaimDTO, ClaimState, SearchOption } from '../types';

/**
 * 로컬 상태를 API 상태로 매핑
 */
function mapClaimStateToApiState(state: ClaimState | null): GetComplainListState | undefined {
  if (!state) return undefined;

  const stateMap: Record<ClaimState, GetComplainListState> = {
    RECEIVED: 'ISSUE',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETE',
    REJECTED: 'CANCEL',
  };

  return stateMap[state];
}

/**
 * 기간 필터 타입
 */
export type PeriodFilter = 'today' | '3day' | '7day' | 'month';

/**
 * 기간 필터별 날짜 계산
 */
export function getPeriodDates(period: PeriodFilter): { from: string; to: string } {
  const today = new Date();
  const formatDate = (date: Date): string => {
    const result = date.toISOString().split('T')[0];
    return result || '';
  };

  const to = formatDate(today);

  switch (period) {
    case 'today':
      return { from: to, to };
    case '3day': {
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 2);
      return { from: formatDate(fromDate), to };
    }
    case '7day': {
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 6);
      return { from: formatDate(fromDate), to };
    }
    case 'month': {
      const fromDate = new Date(today);
      fromDate.setMonth(today.getMonth() - 1);
      fromDate.setDate(fromDate.getDate() + 1);
      return { from: formatDate(fromDate), to };
    }
    default:
      return { from: to, to };
  }
}

/**
 * 기간 필터별 라벨
 */
export const PERIOD_FILTER_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'today', label: '당일' },
  { value: '3day', label: '3일' },
  { value: '7day', label: '7일' },
  { value: 'month', label: '한달' },
];

interface UseClaimsOptions {
  buildingId?: number;
  state?: ClaimState | null;
  searchKeyword?: string;
  searchOption?: SearchOption;
  period?: PeriodFilter;
  page?: number;
  size?: number;
  /** Mock 데이터 사용 여부 (개발용) */
  useMock?: boolean;
}

/**
 * 고객불편 목록 조회 Hook
 *
 * @example
 * ```tsx
 * const { claims, isLoading, refetch } = useClaims({
 *   buildingId: 1,
 *   state: 'PROCESSING',
 *   period: '7day',
 * });
 * ```
 */
export function useClaims({
  buildingId = 1,
  state = null,
  searchKeyword = '',
  searchOption = 'ALL',
  period = '3day',
  page = 0,
  size = 20,
  useMock = true,
}: UseClaimsOptions = {}) {
  const { from: termDateFrom, to: termDateTo } = getPeriodDates(period);

  // API 조회 (실제 사용 시)
  const apiState = mapClaimStateToApiState(state);
  const apiQuery = useQuery({
    queryKey: [
      ...getGetComplainListQueryKey({ buildingId }),
      { state: apiState, searchKeyword, termDateFrom, termDateTo, page, size },
    ],
    queryFn: () => {
      const params: GetComplainListParams = {
        buildingId,
        page,
        size,
        state: apiState,
        searchKeyword: searchKeyword || undefined,
        termDateFrom,
        termDateTo,
      };
      return getComplainList(params);
    },
    enabled: !useMock && !!buildingId,
  });

  // Mock 데이터 필터링
  const filteredMockData = useMemo(() => {
    if (!useMock) return [];

    let filtered = [...mockClaims];

    // 상태 필터
    if (state) {
      filtered = filtered.filter((claim) => claim.state === state);
    }

    // 검색 필터
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((claim) => {
        switch (searchOption) {
          case 'TITLE':
            return claim.title.toLowerCase().includes(keyword);
          case 'CONTENT':
            return claim.content.toLowerCase().includes(keyword);
          case 'PHONE':
            return claim.phoneNumber?.includes(keyword);
          case 'ALL':
          default:
            return (
              claim.title.toLowerCase().includes(keyword) ||
              claim.content.toLowerCase().includes(keyword) ||
              claim.phoneNumber?.includes(keyword)
            );
        }
      });
    }

    // 기간 필터 (Mock 데이터에서는 간단히 처리)
    // 실제로는 receivedDate 기준으로 필터링 필요

    return filtered;
  }, [useMock, state, searchKeyword, searchOption]);

  // 상태별 카운트
  const stateCounts = useMemo(() => {
    const source = useMock ? mockClaims : [];
    const counts: Record<string, number> = { all: source.length };
    source.forEach((claim) => {
      counts[claim.state] = (counts[claim.state] || 0) + 1;
    });
    return counts;
  }, [useMock]);

  if (useMock) {
    return {
      claims: filteredMockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => {},
      stateCounts,
      totalCount: filteredMockData.length,
    };
  }

  return {
    claims: (apiQuery.data?.data?.content as unknown as ClaimDTO[]) || [],
    isLoading: apiQuery.isLoading,
    isError: apiQuery.isError,
    error: apiQuery.error,
    refetch: apiQuery.refetch,
    stateCounts,
    totalCount: apiQuery.data?.data?.totalElements || 0,
  };
}

/**
 * 고객불편 무한 스크롤 Hook
 */
export function useClaimsInfinite({
  buildingId = 1,
  state = null,
  searchKeyword = '',
  period = '3day',
  size = 20,
}: Omit<UseClaimsOptions, 'page' | 'useMock'>) {
  const { from: termDateFrom, to: termDateTo } = getPeriodDates(period);
  const apiState = mapClaimStateToApiState(state);

  return useInfiniteQuery<ComplainListResponse>({
    queryKey: [
      ...getGetComplainListQueryKey({ buildingId }),
      'infinite',
      { state: apiState, searchKeyword, termDateFrom, termDateTo, size },
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const params: GetComplainListParams = {
        buildingId,
        page: pageParam as number,
        size,
        state: apiState,
        searchKeyword: searchKeyword || undefined,
        termDateFrom,
        termDateTo,
      };

      return getComplainList(params);
    },
    getNextPageParam: (lastPage) => {
      const data = lastPage.data;
      if (!data) return undefined;

      const pageNumber = (data as unknown as { pageNumber: number }).pageNumber;
      const totalPages = (data as unknown as { totalPages: number }).totalPages;
      if (pageNumber === undefined || totalPages === undefined) return undefined;
      if (pageNumber >= totalPages - 1) return undefined;

      return pageNumber + 1;
    },
    initialPageParam: 0,
  });
}

export default useClaims;
