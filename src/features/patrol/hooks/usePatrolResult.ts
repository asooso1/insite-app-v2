/**
 * 순찰 점검 결과 조회 및 저장 훅
 *
 * @description 특정 구역의 점검 결과를 조회하고 저장/수정합니다
 */

import {
  useGetPatrolResult,
  useSavePatrolResult,
  useUpdatePatrolResult,
} from '@/api/generated/patrol/patrol';
import type { PatrolResultItemDTO } from '@/api/generated/models';

interface UsePatrolResultOptions {
  nfcRoundId: number;
  buildingFloorZoneId: number;
  enabled?: boolean;
}

/**
 * 순찰 점검 결과 조회 훅
 *
 * @param options - nfcRoundId, buildingFloorZoneId, enabled 옵션
 * @returns 점검 결과 목록 및 쿼리 상태
 *
 * @example
 * ```tsx
 * const { results, isLoading } = usePatrolResult({
 *   nfcRoundId: 1001,
 *   buildingFloorZoneId: 101,
 * });
 *
 * results?.forEach(result => {
 *   console.log(result.actionType); // "NONE", "ON_SITE", "NOT_POSSIBLE"
 *   console.log(result.actionTaken); // "정상", "조치 완료", "수리 필요"
 *   console.log(result.images); // 첨부 이미지 목록
 * });
 * ```
 */
export function usePatrolResult({
  nfcRoundId,
  buildingFloorZoneId,
  enabled = true,
}: UsePatrolResultOptions) {
  const query = useGetPatrolResult(
    { nfcRoundId, buildingFloorZoneId },
    {
      query: {
        enabled: enabled && !!nfcRoundId && !!buildingFloorZoneId,
        select: (response) => response.data || [],
      },
    }
  );

  return {
    ...query,
    results: query.data as PatrolResultItemDTO[] | undefined,
  };
}

/**
 * 순찰 점검 결과 저장 훅
 *
 * @returns 저장 mutation 함수 및 상태
 *
 * @example
 * ```tsx
 * const { saveResult, isSaving } = useSavePatrolResult();
 *
 * const handleSave = async () => {
 *   const formData = new FormData();
 *   formData.append('nfcRoundId', '1001');
 *   formData.append('buildingFloorZoneId', '101');
 *   formData.append('results', JSON.stringify([
 *     { nfcRoundItemId: 5001, actionType: 'ON_SITE', actionTaken: '정상' }
 *   ]));
 *
 *   await saveResult({ data: formData });
 * };
 * ```
 */
export function useSavePatrolResultMutation() {
  const mutation = useSavePatrolResult();

  return {
    saveResult: mutation.mutateAsync,
    isSaving: mutation.isPending,
    ...mutation,
  };
}

/**
 * 순찰 점검 결과 수정 훅
 *
 * @returns 수정 mutation 함수 및 상태
 *
 * @example
 * ```tsx
 * const { updateResult, isUpdating } = useUpdatePatrolResultMutation();
 *
 * const handleUpdate = async () => {
 *   const formData = new FormData();
 *   formData.append('nfcRoundId', '1001');
 *   formData.append('buildingFloorZoneId', '101');
 *   formData.append('results', JSON.stringify([
 *     { nfcRoundItemId: 5001, actionType: 'NOT_POSSIBLE', actionTaken: '수리 필요' }
 *   ]));
 *   formData.append('deleteImageIds', JSON.stringify([3001, 3002]));
 *
 *   await updateResult({ data: formData });
 * };
 * ```
 */
export function useUpdatePatrolResultMutation() {
  const mutation = useUpdatePatrolResult();

  return {
    updateResult: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    ...mutation,
  };
}

/**
 * 점검 결과 FormData 생성 헬퍼
 *
 * @param data - 점검 결과 데이터
 * @returns FormData 객체
 */
export function createPatrolResultFormData(data: {
  nfcRoundId: number;
  buildingFloorZoneId: number;
  results: {
    nfcRoundItemId: number;
    actionType: 'NONE' | 'ON_SITE' | 'NOT_POSSIBLE';
    actionTaken: string;
  }[];
  images?: File[];
  deleteImageIds?: number[];
}): FormData {
  const formData = new FormData();

  formData.append('nfcRoundId', data.nfcRoundId.toString());
  formData.append('buildingFloorZoneId', data.buildingFloorZoneId.toString());
  formData.append('results', JSON.stringify(data.results));

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  if (data.deleteImageIds && data.deleteImageIds.length > 0) {
    formData.append('deleteImageIds', JSON.stringify(data.deleteImageIds));
  }

  return formData;
}
