/**
 * 작업지시 기능 타입 정의
 *
 * Orval 생성 타입을 재export하여 편리한 임포트 제공
 */
export type {
  WorkOrderDTO,
  WorkOrderDTOState,
  WorkOrderDetailDTO,
  WorkOrderDetailResponse,
  WorkOrderListResponse,
  WorkOrderItemDTO,
  WorkOrderResultDTO,
  WorkOrderResultRequest,
  GetWorkOrderListParams,
  AttachmentDTO,
} from '@/api/generated/models';

// 체크리스트 타입
export type {
  ChecklistResultType,
  ChecklistItemData,
  ChecklistItemResult,
  WorkResultFormData,
} from './checklist.types';
