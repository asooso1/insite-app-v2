/**
 * 작업지시 생성 커스텀 훅
 *
 * 작업지시를 생성하고 파일 업로드를 처리합니다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiClient } from '@/api/client';

/**
 * 작업지시 생성 요청 데이터
 */
interface CreateWorkOrderData {
  name: string;
  description?: string;
  firstClassId: number;
  secondClassId: number;
  planStartDate: Date;
  planEndDate: Date;
  buildingId: number;
  chargeAccountIds: number[];
  approveAccountIds?: number[];
  files?: File[];
}

/**
 * 작업지시 생성 응답
 */
interface CreateWorkOrderResponse {
  code: string;
  message: string;
  data?: {
    workorderId: number;
  };
}

/**
 * 작업지시 생성 API 호출
 */
async function createWorkOrder(data: CreateWorkOrderData): Promise<CreateWorkOrderResponse> {
  // FormData 생성 (파일 업로드용)
  const formData = new FormData();

  // 기본 필드 추가
  formData.append('name', data.name);
  if (data.description) {
    formData.append('description', data.description);
  }
  formData.append('firstClassId', String(data.firstClassId));
  formData.append('secondClassId', String(data.secondClassId));
  formData.append('planStartDate', format(data.planStartDate, 'yyyy-MM-dd'));
  formData.append('planEndDate', format(data.planEndDate, 'yyyy-MM-dd'));
  formData.append('buildingId', String(data.buildingId));

  // 담당자 ID 배열 추가
  data.chargeAccountIds.forEach((id) => {
    formData.append('chargeAccountIds', String(id));
  });

  // 승인자 ID 배열 추가 (선택)
  if (data.approveAccountIds && data.approveAccountIds.length > 0) {
    data.approveAccountIds.forEach((id) => {
      formData.append('approveAccountIds', String(id));
    });
  }

  // 파일 첨부 (선택)
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await apiClient.post<CreateWorkOrderResponse>(
    '/m/api/workOrder/addOrder/v2',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * 작업지시 생성 훅
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateWorkOrder();
 *
 * const handleSubmit = (data: CreateWorkOrderData) => {
 *   mutate(data, {
 *     onSuccess: () => {
 *       router.back();
 *     },
 *     onError: (error) => {
 *       console.error('생성 실패:', error);
 *     },
 *   });
 * };
 * ```
 */
export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      // 작업지시 목록 캐시 무효화 (재조회 유도)
      queryClient.invalidateQueries({
        queryKey: ['workOrders'],
      });
    },
  });
}

export type { CreateWorkOrderData, CreateWorkOrderResponse };
