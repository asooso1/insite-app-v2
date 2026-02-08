/**
 * 순찰 액션 훅
 *
 * @description 순찰 구역 상태 변경, 완료 요청 등의 액션을 수행합니다
 */

import { useUpdatePatrolZoneState, useRequestCompletePatrol } from '@/api/generated/patrol/patrol';
import { useQueryClient } from '@tanstack/react-query';
import { getGetPatrolTargetsQueryKey, getGetPatrolDetailQueryKey } from '@/api/generated/patrol/patrol';

/**
 * 순찰 구역 상태 변경 훅
 *
 * @description 구역 상태를 ISSUE → PROCESSING으로 변경합니다
 *
 * @example
 * ```tsx
 * const { updateState, isUpdating } = useUpdatePatrolZoneState();
 *
 * const handleStartPatrol = async () => {
 *   await updateState({
 *     nfcRoundId: 1001,
 *     buildingFloorZoneId: 101,
 *   });
 * };
 * ```
 */
export function useUpdatePatrolZoneStateMutation() {
  const queryClient = useQueryClient();
  const mutation = useUpdatePatrolZoneState({
    mutation: {
      onSuccess: (_data, variables) => {
        // 순찰 대상 목록 갱신
        queryClient.invalidateQueries({
          queryKey: getGetPatrolTargetsQueryKey({ nfcRoundId: variables.data.nfcRoundId }),
        });
        // 순찰 상세 정보 갱신
        queryClient.invalidateQueries({
          queryKey: getGetPatrolDetailQueryKey(variables.data.nfcRoundId),
        });
      },
    },
  });

  return {
    updateState: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    ...mutation,
  };
}

/**
 * 순찰 완료 요청 훅
 *
 * @description 순찰점검 완료를 요청합니다
 *
 * @example
 * ```tsx
 * const { requestComplete, isRequesting } = useRequestCompletePatrolMutation();
 *
 * const handleComplete = async () => {
 *   try {
 *     await requestComplete({ nfcRoundId: 1001 });
 *     Alert.alert('성공', '순찰 완료 요청이 완료되었습니다.');
 *   } catch (error) {
 *     Alert.alert('오류', '미완료된 구역이 있습니다.');
 *   }
 * };
 * ```
 */
export function useRequestCompletePatrolMutation() {
  const queryClient = useQueryClient();
  const mutation = useRequestCompletePatrol({
    mutation: {
      onSuccess: (_data, variables) => {
        // 순찰 대상 목록 갱신
        queryClient.invalidateQueries({
          queryKey: getGetPatrolTargetsQueryKey({ nfcRoundId: variables.nfcRoundId }),
        });
        // 순찰 상세 정보 갱신
        queryClient.invalidateQueries({
          queryKey: getGetPatrolDetailQueryKey(variables.nfcRoundId),
        });
      },
    },
  });

  return {
    requestComplete: mutation.mutateAsync,
    isRequesting: mutation.isPending,
    ...mutation,
  };
}
