/**
 * 일상업무 관련 React Query Hooks
 *
 * API 연동을 위한 커스텀 훅들
 * - 목록 조회 (무한 스크롤)
 * - 상세 조회
 * - 등록/수정/확인 mutation
 */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  PersonalWorkOrderListResponse,
  GetPersonalWorkOrderListParams,
  PersonalWorkOrderDetailResponse,
  CreatePersonalWorkOrderRequest,
  ConfirmPersonalWorkOrderRequest,
} from '@/api/generated/models';
import {
  getPersonalWorkOrderList,
  getGetPersonalWorkOrderListQueryKey,
  getPersonalWorkOrderDetail,
  getGetPersonalWorkOrderDetailQueryKey,
  managePersonalWorkOrder,
} from '@/api/generated/personal/personal';
// import { useAuthStore } from '@/stores/auth.store';

/**
 * 일상업무 목록 조회 파라미터
 */
interface UsePersonalTasksParams {
  /** 조회 날짜 (YYYY-MM-DD) */
  date: string;
  /** 팀 ID 필터 (선택) */
  teamId?: number;
  /** 검색어 (선택) */
  searchKeyword?: string;
  /** 페이지 크기 */
  size?: number;
  /** 쿼리 활성화 여부 */
  enabled?: boolean;
}

/**
 * 일상업무 목록 조회 Hook (무한 스크롤)
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage, isLoading } = usePersonalTasksInfinite({
 *   date: '2026-02-10',
 *   teamId: 1,
 * });
 * ```
 */
export function usePersonalTasksInfinite({
  date,
  teamId,
  searchKeyword,
  size = 10,
  enabled = true,
}: UsePersonalTasksParams) {
  // 빌딩 ID는 auth store에서 가져옴 (실제 구현시)
  // const buildingId = useAuthStore((state) => state.user?.siteId);
  const buildingId = 1; // Mock: 실제로는 auth store에서 가져옴

  return useInfiniteQuery<PersonalWorkOrderListResponse>({
    queryKey: [
      ...getGetPersonalWorkOrderListQueryKey({
        buildingId,
        termDateFrom: date,
        termDateTo: date,
      }),
      'infinite',
      { teamId, searchKeyword, size },
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const params: GetPersonalWorkOrderListParams = {
        buildingId,
        page: pageParam as number,
        size,
        termDateFrom: date,
        termDateTo: date,
        teamId,
      };

      return getPersonalWorkOrderList(params);
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
    enabled,
  });
}

/**
 * 일상업무 상세 조회 파라미터
 */
interface UsePersonalTaskDetailParams {
  /** 일상업무 ID */
  id: number;
  /** 쿼리 활성화 여부 */
  enabled?: boolean;
}

/**
 * 일상업무 상세 조회 Hook
 *
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = usePersonalTaskDetail({ id: 123 });
 * ```
 */
export function usePersonalTaskDetail({ id, enabled = true }: UsePersonalTaskDetailParams) {
  return useQuery<PersonalWorkOrderDetailResponse>({
    queryKey: getGetPersonalWorkOrderDetailQueryKey(id),
    queryFn: () => getPersonalWorkOrderDetail(id),
    enabled: enabled && id > 0,
  });
}

/**
 * 일상업무 등록 Mutation Hook
 *
 * @example
 * ```tsx
 * const { mutate, isLoading } = useCreatePersonalTask();
 * mutate({
 *   title: '회의실 청소',
 *   description: '3층 회의실 청소 및 정리',
 * });
 * ```
 */
export function useCreatePersonalTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonalWorkOrderRequest) => {
      return managePersonalWorkOrder(data, { type: 'create' });
    },
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['/m/api/personal/work-order'],
      });
    },
  });
}

/**
 * 일상업무 확인 Mutation Hook
 *
 * @example
 * ```tsx
 * const { mutate, isLoading } = useConfirmPersonalTask();
 * mutate({ workOrderIds: [123, 456] });
 * ```
 */
export function useConfirmPersonalTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfirmPersonalWorkOrderRequest) => {
      return managePersonalWorkOrder(data, { type: 'confirm' });
    },
    onSuccess: (_data, variables) => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['/m/api/personal/work-order'],
      });
      // 상세 캐시 무효화 (확인된 건들)
      if ('workOrderIds' in variables && Array.isArray(variables.workOrderIds)) {
        variables.workOrderIds.forEach((id: number) => {
          queryClient.invalidateQueries({
            queryKey: getGetPersonalWorkOrderDetailQueryKey(id),
          });
        });
      }
    },
  });
}
