/**
 * 작업지시 상세 조회 커스텀 훅
 *
 * Orval 생성 훅을 래핑하여 추가 기능 제공:
 * - 상세 정보 조회
 * - 작업 결과 등록
 * - 작업지시 발행
 */
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetWorkOrderDetail,
  useIssueWorkOrder,
  useAddWorkOrderResult,
  getGetWorkOrderListQueryKey,
} from '@/api/generated/work-order/work-order';
import type { WorkOrderResultRequest } from '@/api/generated/models';

interface UseWorkOrderDetailOptions {
  workOrderId: number;
  enabled?: boolean;
}

/**
 * 작업지시 상세 조회 훅
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   issue,
 *   addResult
 * } = useWorkOrderDetail({ workOrderId: 123 });
 * ```
 */
export function useWorkOrderDetail({ workOrderId, enabled = true }: UseWorkOrderDetailOptions) {
  const queryClient = useQueryClient();

  // 상세 정보 조회
  const detailQuery = useGetWorkOrderDetail(workOrderId, {
    query: {
      enabled: enabled && !!workOrderId,
      staleTime: 1000 * 60 * 5, // 5분
    },
  });

  // 작업지시 발행 mutation
  const issueMutation = useIssueWorkOrder({
    mutation: {
      onSuccess: () => {
        // 상세 정보 갱신
        queryClient.invalidateQueries({
          queryKey: detailQuery.queryKey,
        });
        // 목록 갱신
        queryClient.invalidateQueries({
          queryKey: getGetWorkOrderListQueryKey(),
        });
      },
    },
  });

  // 작업 결과 등록 mutation
  const addResultMutation = useAddWorkOrderResult({
    mutation: {
      onSuccess: () => {
        // 상세 정보 갱신
        queryClient.invalidateQueries({
          queryKey: detailQuery.queryKey,
        });
        // 목록 갱신
        queryClient.invalidateQueries({
          queryKey: getGetWorkOrderListQueryKey(),
        });
      },
    },
  });

  return {
    // 조회 데이터
    data: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    error: detailQuery.error,
    refetch: detailQuery.refetch,

    // 작업지시 발행
    issue: (workorderId: number) => issueMutation.mutate({ workorderId }),
    isIssuing: issueMutation.isPending,

    // 작업 결과 등록
    addResult: (data: WorkOrderResultRequest) => addResultMutation.mutate({ data }),
    isAddingResult: addResultMutation.isPending,
  };
}
