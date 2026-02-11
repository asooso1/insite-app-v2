/**
 * 고객불편 상세 조회 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getComplainDetail,
  getGetComplainDetailQueryKey,
} from '@/api/generated/complain/complain';
import { mockClaims } from '../utils/mockData';
import type { ClaimDTO } from '../types';

interface UseClaimDetailOptions {
  claimId: number;
  enabled?: boolean;
  /** Mock 데이터 사용 여부 (개발용) */
  useMock?: boolean;
}

/**
 * 고객불편 상세 조회 Hook
 *
 * @example
 * ```tsx
 * const { claim, isLoading, updateStatus, createWorkOrder } = useClaimDetail({
 *   claimId: 1,
 * });
 * ```
 */
export function useClaimDetail({
  claimId,
  enabled = true,
  useMock = true,
}: UseClaimDetailOptions) {
  const queryClient = useQueryClient();

  // API 조회 (실제 사용 시)
  const apiQuery = useQuery({
    queryKey: getGetComplainDetailQueryKey(claimId),
    queryFn: () => getComplainDetail(claimId),
    enabled: !useMock && enabled && !!claimId,
  });

  // Mock 데이터에서 조회
  const mockClaim = useMock ? mockClaims.find((c) => c.id === claimId) : null;

  // 상태 업데이트 Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      status,
      processResult,
    }: {
      status: 'PROCESSING' | 'COMPLETED' | 'REJECTED';
      processResult?: string;
    }) => {
      // TODO: 실제 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { status, processResult };
    },
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: getGetComplainDetailQueryKey(claimId),
      });
    },
  });

  // 수시업무 발행 Mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: async (claimData: ClaimDTO) => {
      // TODO: 실제 작업지시 생성 API 호출
      console.log('Creating work order for claim:', claimData.id);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { workOrderId: Date.now() };
    },
    onSuccess: () => {
      // 성공 시 처리 (작업지시 상세로 이동 등)
    },
  });

  if (useMock) {
    return {
      claim: mockClaim || null,
      isLoading: false,
      isError: !mockClaim,
      error: mockClaim ? null : new Error('고객불편을 찾을 수 없습니다.'),
      refetch: async () => {},
      updateStatus: updateStatusMutation.mutate,
      isUpdatingStatus: updateStatusMutation.isPending,
      createWorkOrder: createWorkOrderMutation.mutate,
      isCreatingWorkOrder: createWorkOrderMutation.isPending,
    };
  }

  return {
    claim: apiQuery.data?.data as unknown as ClaimDTO | null,
    isLoading: apiQuery.isLoading,
    isError: apiQuery.isError,
    error: apiQuery.error,
    refetch: apiQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    createWorkOrder: createWorkOrderMutation.mutate,
    isCreatingWorkOrder: createWorkOrderMutation.isPending,
  };
}

export default useClaimDetail;
