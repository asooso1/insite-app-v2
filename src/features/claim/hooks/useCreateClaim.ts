/**
 * 고객불편 등록 Hook
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComplain, getGetComplainListQueryKey } from '@/api/generated/complain/complain';
import type { AddComplainRequest } from '@/api/generated/models';
import type { CreateClaimRequest } from '../types';

interface UseCreateClaimOptions {
  /** 성공 시 콜백 */
  onSuccess?: (claimId: number) => void;
  /** 실패 시 콜백 */
  onError?: (error: Error) => void;
}

/**
 * 고객불편 등록 Hook
 *
 * @example
 * ```tsx
 * const { createClaim, isLoading } = useCreateClaim({
 *   onSuccess: (id) => router.push(`/claim/${id}`),
 * });
 *
 * createClaim({
 *   title: '회의실 온도 문제',
 *   content: '너무 더워요',
 *   templateType: 'HOT',
 * });
 * ```
 */
export function useCreateClaim({ onSuccess, onError }: UseCreateClaimOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateClaimRequest) => {
      // 실제 API 호출을 위한 데이터 변환
      const apiData: AddComplainRequest = {
        title: data.title,
        description: data.content,
        buildingId: data.buildingId || 1,
        location: [data.floor, data.zone, data.location].filter(Boolean).join(' > '),
        reporterName: '현장 담당자', // TODO: 실제 사용자 정보 사용
        reporterPhone: data.phoneNumber || '',
        categoryId: undefined, // 템플릿 타입과 매핑 필요
        files: data.attachmentIds?.map(String),
      };

      const response = await addComplain(apiData);
      return { id: response.data?.complainId || 0 };
    },
    onSuccess: (data) => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: getGetComplainListQueryKey({ buildingId: 1 }),
      });

      onSuccess?.(data.id);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  return {
    createClaim: mutation.mutate,
    createClaimAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export default useCreateClaim;
