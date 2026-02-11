/**
 * 고객불편(VOC/Claim) 관련 타입 정의
 */

/**
 * 고객불편 상태
 */
export type ClaimState = 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

/**
 * 검색 옵션
 */
export type SearchOption = 'ALL' | 'TITLE' | 'CONTENT' | 'PHONE';

/**
 * 고객불편 DTO
 */
export interface ClaimDTO {
  /** 고객불편 ID */
  id: number;
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
  /** 상태 */
  state: ClaimState;
  /** 상태명 */
  stateName?: string;
  /** 접수일시 */
  receivedDate: string;
  /** 처리일시 */
  processedDate?: string;
  /** 완료일시 */
  completedDate?: string;
  /** 건물명 */
  buildingName?: string;
  /** 층 */
  floor?: string;
  /** 구역 */
  zone?: string;
  /** 위치 상세 */
  location?: string;
  /** 전화번호 */
  phoneNumber?: string;
  /** 접수자명 */
  receiverName?: string;
  /** 처리자명 */
  processorName?: string;
  /** 템플릿 여부 */
  isTemplate?: boolean;
  /** 템플릿 타입 (더워요/추워요/청소해주세요 등) */
  templateType?: string;
  /** 첨부파일 */
  attachments?: ClaimAttachment[];
  /** 처리 결과 내용 */
  processResult?: string;
}

/**
 * 고객불편 첨부파일
 */
export interface ClaimAttachment {
  /** 첨부파일 ID */
  id: number;
  /** 파일명 */
  fileName: string;
  /** 파일 URL */
  fileUrl: string;
  /** 파일 타입 */
  fileType?: string;
  /** 파일 크기 (bytes) */
  fileSize?: number;
  /** 등록일시 */
  createdAt?: string;
}

/**
 * 고객불편 등록 요청
 */
export interface CreateClaimRequest {
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
  /** 건물 ID */
  buildingId?: number;
  /** 층 */
  floor?: string;
  /** 구역 */
  zone?: string;
  /** 위치 상세 */
  location?: string;
  /** 전화번호 */
  phoneNumber?: string;
  /** 템플릿 타입 */
  templateType?: string;
  /** 첨부파일 IDs */
  attachmentIds?: number[];
}

/**
 * 고객불편 업데이트 요청
 */
export interface UpdateClaimRequest {
  /** 고객불편 ID */
  claimId: number;
  /** 상태 */
  state?: ClaimState;
  /** 처리 결과 */
  processResult?: string;
}

/**
 * 고객불편 목록 조회 요청
 */
export interface GetClaimsRequest {
  /** 검색어 */
  searchText?: string;
  /** 검색 옵션 */
  searchOption?: SearchOption;
  /** 상태 필터 */
  state?: ClaimState;
  /** 시작일 */
  startDate?: string;
  /** 종료일 */
  endDate?: string;
  /** 페이지 */
  page?: number;
  /** 페이지 크기 */
  size?: number;
}

/**
 * 고객불편 템플릿 타입
 */
export const CLAIM_TEMPLATES = {
  HOT: { type: 'HOT', label: '더워요', icon: '🔥', content: '실내 온도가 너무 높습니다.' },
  COLD: { type: 'COLD', label: '추워요', icon: '❄️', content: '실내 온도가 너무 낮습니다.' },
  CLEANING: {
    type: 'CLEANING',
    label: '청소해주세요',
    icon: '🧹',
    content: '청소가 필요합니다.',
  },
  NOISE: { type: 'NOISE', label: '소음', icon: '🔊', content: '소음이 발생합니다.' },
  LIGHT: { type: 'LIGHT', label: '조명', icon: '💡', content: '조명에 문제가 있습니다.' },
  WATER: { type: 'WATER', label: '누수', icon: '💧', content: '누수가 발생했습니다.' },
  ELEVATOR: {
    type: 'ELEVATOR',
    label: '엘리베이터',
    icon: '🛗',
    content: '엘리베이터에 문제가 있습니다.',
  },
  PARKING: {
    type: 'PARKING',
    label: '주차',
    icon: '🅿️',
    content: '주차 관련 불편사항입니다.',
  },
  OTHER: { type: 'OTHER', label: '기타', icon: '📝', content: '' },
} as const;

export type ClaimTemplateType = keyof typeof CLAIM_TEMPLATES;
