/**
 * 승인/확인 관련 타입 정의
 *
 * v1 앱 기능:
 * - 업무 확인 목록 (작업지시, 순찰, 긴급, 정기, 수시, 일상)
 * - 미승인 필터
 * - 선택 모드 (일괄 확인)
 * - 날짜 필터 (오늘 할 일 / 과거 미확인)
 */

/**
 * 승인 항목 타입
 */
export type ApprovalType = 'WORK' | 'PATROL' | 'EMERGENCY' | 'REGULAR' | 'ADHOC' | 'DAILY';

/**
 * 승인 상태
 */
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * 승인 항목 DTO
 */
export interface ApprovalItemDTO {
  /** 고유 ID */
  id: number;
  /** 항목 타입 */
  type: ApprovalType;
  /** 항목 타입명 (한글) */
  typeName: string;
  /** 제목 */
  title: string;
  /** 작성자 */
  writerName?: string;
  /** 건물명 */
  buildingName?: string;
  /** 작성일 */
  createdDate: string;
  /** 완료일 */
  completedDate?: string;
  /** 승인 상태 */
  status: ApprovalStatus;
  /** 우선순위 */
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  /** 첨부파일 수 */
  attachmentCount?: number;
  /** 진행률 (%) */
  progress?: number;
}

/**
 * 승인 목록 응답
 */
export interface ApprovalListResponse {
  data: {
    items: ApprovalItemDTO[];
    total: number;
  };
}

/**
 * 승인 처리 요청
 */
export interface ApprovalRequest {
  /** 항목 ID 목록 */
  ids: number[];
  /** 승인/반려 */
  action: 'APPROVE' | 'REJECT';
  /** 반려 사유 */
  reason?: string;
}

/**
 * 승인 필터 파라미터
 */
export interface ApprovalFilterParams {
  /** 항목 타입 필터 */
  type?: ApprovalType | null;
  /** 승인 상태 필터 */
  status?: ApprovalStatus | null;
  /** 날짜 필터 (today: 오늘, past: 과거) */
  dateFilter?: 'today' | 'past';
  /** 검색어 */
  search?: string;
}
