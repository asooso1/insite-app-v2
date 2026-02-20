/**
 * 고객불편 목록 조회 Hook
 *
 * 실제 API 연동
 */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type {
  ComplainListResponse,
  ComplainDTO as ApiComplainDTO,
  GetComplainListParams,
  GetComplainListState,
} from '@/api/generated/models';
import { getComplainList, getGetComplainListQueryKey } from '@/api/generated/complain/complain';
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
 * API ComplainDTO → 로컬 ClaimDTO 변환
 */
function mapApiComplainToClaimDTO(api: ApiComplainDTO): ClaimDTO {
  const stateMap: Record<string, ClaimState> = {
    WRITE: 'RECEIVED',
    ISSUE: 'RECEIVED',
    PROCESSING: 'PROCESSING',
    REQ_COMPLETE: 'PROCESSING',
    COMPLETE: 'COMPLETED',
    CANCEL: 'REJECTED',
  };

  return {
    id: api.id,
    title: api.title,
    content: api.description ?? '',
    state: stateMap[api.state] ?? 'RECEIVED',
    stateName: api.stateName,
    receivedDate: api.writeDate ?? '',
    completedDate: api.completedDate,
    buildingName: api.buildingName,
    location: api.location,
    phoneNumber: api.reporterPhone,
    receiverName: api.reporterName,
    processorName: api.managerName,
  };
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
}

/**
 * 고객불편 목록 조회 Hook (실제 API 연동)
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
  searchOption: _searchOption = 'ALL',
  period = '3day',
  page = 0,
  size = 20,
}: UseClaimsOptions = {}) {
  const { from: termDateFrom, to: termDateTo } = getPeriodDates(period);
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
    enabled: !!buildingId,
  });

  // API 응답 → 로컬 ClaimDTO 변환
  const claims = useMemo<ClaimDTO[]>(() => {
    const content = apiQuery.data?.data?.content;
    if (!content) return [];
    return content.map(mapApiComplainToClaimDTO);
  }, [apiQuery.data]);

  // 상태별 카운트 (API 데이터 기반)
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: claims.length };
    claims.forEach((claim) => {
      counts[claim.state] = (counts[claim.state] || 0) + 1;
    });
    return counts;
  }, [claims]);

  return {
    claims,
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
}: Omit<UseClaimsOptions, 'page'>) {
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
