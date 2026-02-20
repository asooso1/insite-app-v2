/**
 * 작업 결과 입력 커스텀 훅
 *
 * 체크리스트 조회 및 결과 저장 기능 제공
 * Orval 생성 훅을 래핑하여 API 연동
 */
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAddWorkOrderResult,
  getGetWorkOrderDetailQueryKey,
  getGetWorkOrderListQueryKey,
} from '@/api/generated/work-order/work-order';
import type { WorkOrderItemDTO } from '@/api/generated/models';
import type { ChecklistItemData, WorkResultFormData } from '../types/checklist.types';

interface UseWorkResultOptions {
  workOrderId: number;
  /** 작업 항목 목록 (WorkOrderDetailDTO.items) */
  items?: WorkOrderItemDTO[];
}

/**
 * 작업 결과 입력 훅
 *
 * @example
 * ```tsx
 * const { checklistItems, submitResult, isSubmitting } = useWorkResult({
 *   workOrderId: 123,
 *   items: workOrderDetail?.items,
 * });
 * ```
 */
export function useWorkResult({ workOrderId, items }: UseWorkResultOptions) {
  const queryClient = useQueryClient();

  // 작업 항목 → 체크리스트 데이터 매핑
  const checklistItems = useMemo<ChecklistItemData[]>(
    () =>
      (items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        resultType: 'GOOD_NO_GOOD' as const,
        required: true,
      })),
    [items],
  );

  // 결과 저장 mutation (Orval 생성 훅 사용)
  const addResultMutation = useAddWorkOrderResult({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetWorkOrderDetailQueryKey(workOrderId),
        });
        queryClient.invalidateQueries({
          queryKey: getGetWorkOrderListQueryKey(),
        });
      },
    },
  });

  /**
   * 작업 결과 저장
   */
  const submitResult = async (data: WorkResultFormData) => {
    // 폼 데이터를 content 문자열로 직렬화
    const content = JSON.stringify({
      takeAction: data.takeAction,
      accidentType: data.accidentType,
      accidentReason: data.accidentReason,
      damage: data.damage,
      countermeasure: data.countermeasure,
      improvement: data.improvement,
      checklistResults: data.checklistResults,
    });

    return addResultMutation.mutateAsync({
      data: {
        workOrderId,
        content,
      },
    });
  };

  /**
   * 이미지 업로드
   *
   * TODO: 파일 업로드 API 연동 시 구현
   */
  const uploadImages = async (images: string[]): Promise<string[]> => {
    return images;
  };

  return {
    /** 체크리스트 항목 목록 */
    checklistItems,
    /** 결과 저장 함수 */
    submitResult,
    /** 이미지 업로드 함수 */
    uploadImages,
    /** 제출 중 여부 */
    isSubmitting: addResultMutation.isPending,
    /** 제출 성공 여부 */
    isSuccess: addResultMutation.isSuccess,
    /** 제출 에러 */
    error: addResultMutation.error,
  };
}
