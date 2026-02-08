/**
 * 작업지시 목록 조회 커스텀 훅
 *
 * Orval 생성 훅을 래핑하여 추가 기능 제공:
 * - 상태별 필터링
 * - 검색
 * - 페이지네이션
 */
import { useGetWorkOrderList } from '@/api/generated/work-order/work-order';
import type { GetWorkOrderListParams } from '@/api/generated/models';

interface UseWorkOrdersOptions extends Partial<GetWorkOrderListParams> {
  enabled?: boolean;
}

/**
 * 작업지시 목록 조회 훅
 *
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useWorkOrders({
 *   buildingId: 1,
 *   state: 'ISSUE',
 *   page: 0,
 *   size: 20
 * });
 * ```
 */
export function useWorkOrders({
  buildingId = 1,
  page = 0,
  size = 20,
  state,
  searchKeyword,
  termDateFrom,
  termDateTo,
  enabled = true,
}: UseWorkOrdersOptions = {}) {
  const params: GetWorkOrderListParams = {
    buildingId,
    page,
    size,
    ...(state && { state }),
    ...(searchKeyword && { searchKeyword }),
    ...(termDateFrom && { termDateFrom }),
    ...(termDateTo && { termDateTo }),
  };

  return useGetWorkOrderList(params, {
    query: {
      enabled,
      staleTime: 1000 * 60 * 5, // 5분
    },
  });
}
