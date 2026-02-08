/**
 * 작업지시 무한 스크롤 Hook
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import type { WorkOrderListResponse, GetWorkOrderListParams } from '@/api/generated/models';
import { getWorkOrderList, getGetWorkOrderListQueryKey } from '@/api/generated/work-order/work-order';

interface UseWorkOrdersInfiniteOptions {
  buildingId: number;
  state?: GetWorkOrderListParams['state'];
  searchKeyword?: string;
  termDateFrom?: string;
  termDateTo?: string;
  size?: number;
}

/**
 * 작업지시 목록을 무한 스크롤로 조회하는 Hook
 */
export function useWorkOrdersInfinite({
  buildingId,
  state,
  searchKeyword,
  termDateFrom,
  termDateTo,
  size = 10,
}: UseWorkOrdersInfiniteOptions) {
  return useInfiniteQuery<WorkOrderListResponse>({
    queryKey: [...getGetWorkOrderListQueryKey({ buildingId }), 'infinite', { state, searchKeyword, termDateFrom, termDateTo, size }],
    queryFn: async ({ pageParam = 0 }) => {
      const params: GetWorkOrderListParams = {
        buildingId,
        page: pageParam as number,
        size,
        state,
        searchKeyword,
        termDateFrom,
        termDateTo,
      };

      return getWorkOrderList(params);
    },
    getNextPageParam: (lastPage) => {
      const data = lastPage.data;
      if (!data) return undefined;

      const { pageNumber, totalPages } = data;
      if (pageNumber === undefined || totalPages === undefined) return undefined;
      if (pageNumber >= totalPages - 1) return undefined;

      return pageNumber + 1;
    },
    initialPageParam: 0,
  });
}
