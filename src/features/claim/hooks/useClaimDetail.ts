/**
 * 고객불편 상세 조회 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComplainDetail, getGetComplainDetailQueryKey } from '@/api/generated/complain/complain';
import type { ComplainDetailDTO } from '@/api/generated/models';
import type { ClaimDTO, ClaimState, ClaimAttachment } from '../types';

interface UseClaimDetailOptions {
  claimId: number;
  enabled?: boolean;
}

/**
 * API ComplainDetailDTO → 로컬 ClaimDTO 변환
 */
function mapApiToClaimDTO(api: ComplainDetailDTO): ClaimDTO {
  // 상태 매핑: API(ISSUE/PROCESSING/COMPLETE/CANCEL) → 로컬(RECEIVED/PROCESSING/COMPLETED/REJECTED)
  const stateMap: Record<string, ClaimState> = {
    WRITE: 'RECEIVED',
    ISSUE: 'RECEIVED',
    PROCESSING: 'PROCESSING',
    REQ_COMPLETE: 'PROCESSING',
    COMPLETE: 'COMPLETED',
    CANCEL: 'REJECTED',
  };

  const attachments: ClaimAttachment[] = (api.attachments || []).map((a) => ({
    id: a.id ?? 0,
    fileName: a.fileName ?? '',
    fileUrl: a.fileUrl ?? '',
    fileSize: a.fileSize,
  }));

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
    attachments,
  };
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
export function useClaimDetail({ claimId, enabled = true }: UseClaimDetailOptions) {
  const queryClient = useQueryClient();

  // API 조회
  const apiQuery = useQuery({
    queryKey: getGetComplainDetailQueryKey(claimId),
    queryFn: () => getComplainDetail(claimId),
    enabled: enabled && !!claimId,
  });

  // 상태 업데이트 Mutation (TODO: 실제 상태변경 API 연결 시 구현)
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
  });

  const rawData = apiQuery.data?.data;

  return {
    claim: rawData ? mapApiToClaimDTO(rawData) : null,
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
