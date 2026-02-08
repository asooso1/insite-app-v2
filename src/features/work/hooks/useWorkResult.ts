/**
 * 작업 결과 입력 커스텀 훅
 *
 * 체크리스트 조회 및 결과 저장 기능 제공
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ChecklistItemData, WorkResultFormData } from '../types/checklist.types';

/**
 * Mock 체크리스트 데이터
 *
 * TODO: 실제 API 연동 시 제거
 */
const mockChecklistItems: ChecklistItemData[] = [
  {
    id: 1,
    name: '공조기 필터 상태',
    resultType: 'GOOD_NO_GOOD',
    required: true,
  },
  {
    id: 2,
    name: '팬 벨트 상태',
    resultType: 'GOOD_NO_GOOD',
    required: true,
  },
  {
    id: 3,
    name: '냉매 압력',
    resultType: 'ANALOG',
    unit: 'kPa',
    required: true,
  },
  {
    id: 4,
    name: '이상 소음 여부',
    resultType: 'DO_DONT',
    required: true,
  },
  {
    id: 5,
    name: '점검 비고',
    resultType: 'TEXT',
    required: false,
  },
];

interface UseWorkResultOptions {
  workOrderId: number;
}

/**
 * 작업 결과 입력 훅
 *
 * @example
 * ```tsx
 * const { checklistItems, submitResult, isSubmitting } = useWorkResult({
 *   workOrderId: 123
 * });
 * ```
 */
export function useWorkResult({ workOrderId }: UseWorkResultOptions) {
  // 체크리스트 항목 (Mock 데이터 사용)
  const [checklistItems] = useState<ChecklistItemData[]>(mockChecklistItems);

  // 결과 저장 mutation
  const submitMutation = useMutation({
    mutationFn: async (data: WorkResultFormData) => {
      // TODO: 실제 API 호출로 교체
      console.log('작업 결과 저장:', { workOrderId, ...data });

      // Mock API 지연 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true };
    },
  });

  /**
   * 작업 결과 저장
   */
  const submitResult = async (data: WorkResultFormData) => {
    return submitMutation.mutateAsync(data);
  };

  /**
   * 이미지 업로드
   *
   * TODO: 실제 API 연동 시 구현
   */
  const uploadImages = async (images: string[]): Promise<string[]> => {
    console.log('이미지 업로드:', images);
    // Mock: 이미지 URI 그대로 반환
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
    isSubmitting: submitMutation.isPending,
    /** 제출 성공 여부 */
    isSuccess: submitMutation.isSuccess,
    /** 제출 에러 */
    error: submitMutation.error,
  };
}
