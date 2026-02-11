/**
 * 일상업무 타입 정의
 *
 * v1 PersonalTask 참조하여 정의
 */

/**
 * 일상업무 상태
 */
export type PersonalTaskStatus = 'UNCONFIRMED' | 'CONFIRMED';

/**
 * 작성자 정보
 */
export interface WriterInfo {
  /** 작성자 ID */
  id: number;
  /** 작성자 이름 */
  name: string;
  /** 작성일시 */
  writeDate: string;
  /** 회사명 */
  companyName?: string;
  /** 역할 */
  role?: string;
}

/**
 * 확인자 정보
 */
export interface ConfirmInfo {
  /** 확인자 ID */
  id: number;
  /** 확인자 이름 */
  confirmAccountName: string;
  /** 회사명 */
  companyName?: string;
  /** 역할 */
  role?: string;
  /** 확인일시 */
  confirmedAt?: string;
}

/**
 * 이미지 정보
 */
export interface ImageInfo {
  /** 이미지 ID */
  id?: number;
  /** 이미지 URL */
  imageUrl: string;
  /** 원본 파일명 */
  originalFileName?: string;
}

/**
 * 일상업무 목록 DTO
 */
export interface PersonalTaskDTO {
  /** ID */
  id: number;
  /** 일상업무 ID (alias) */
  personalWorkOrderId?: number;
  /** 제목 */
  title: string;
  /** 내용 */
  content?: string;
  /** 상태 */
  status: PersonalTaskStatus;
  /** 상태명 (API 응답 그대로) */
  state?: string;
  /** 상태명 */
  statusName?: string;
  /** 업무 구분 */
  type?: string;
  /** 일정 시작일 */
  scheduleStartDate?: string;
  /** 일정 종료일 */
  scheduleEndDate?: string;
  /** 등록일 */
  createdAt?: string;
  /** 작성자 정보 */
  writerInfo?: WriterInfo;
  /** 작성자명 (간편) */
  writerName?: string;
  /** 담당자명 */
  assigneeName?: string;
  /** 담당팀명 */
  teamName?: string;
  /** 확인일 */
  confirmedAt?: string;
  /** 확인자명 */
  confirmedByName?: string;
}

/**
 * 일상업무 상세 DTO
 */
export interface PersonalTaskDetailDTO extends PersonalTaskDTO {
  /** 업무 설명 */
  description?: string;
  /** 위치 정보 */
  location?: string;
  /** 빌딩명 */
  buildingName?: string;
  /** 기반지역명 */
  baseArea?: string;
  /** 설비명 */
  facilityName?: string;
  /** 설비 ID */
  facilityId?: number;
  /** 층 ID */
  buildingFloorId?: number;
  /** 층 존 ID */
  buildingFloorZoneId?: number;
  /** 확인자 정보 */
  confirmInfo?: ConfirmInfo;
  /** 이미지 목록 */
  images?: ImageInfo[];
  /** 푸시 알림 여부 */
  isAlertPush?: boolean;
}

/**
 * 일상업무 등록 요청
 */
export interface CreatePersonalTaskRequest {
  /** 빌딩 ID */
  buildingId: number;
  /** 팀 ID */
  buildingUserGroupId?: number;
  /** 제목 */
  title: string;
  /** 내용 */
  description?: string;
  /** 확인자 ID */
  confirmAccountId: number;
  /** 설비 ID */
  facilityId?: number;
  /** 층 존 ID */
  buildingFloorZoneId?: number;
  /** 푸시 알림 여부 */
  isAlertPush?: boolean;
}

/**
 * 일상업무 확인 요청
 */
export interface ConfirmPersonalTaskRequest {
  /** 일상업무 ID 목록 */
  workOrderIds: number[];
}

/**
 * 일상업무 수정 요청
 */
export interface UpdatePersonalTaskRequest {
  /** 일상업무 ID */
  id: number;
  /** 제목 */
  title?: string;
  /** 내용 */
  description?: string;
  /** 확인자 ID */
  confirmAccountId?: number;
  /** 설비 ID */
  facilityId?: number;
  /** 층 존 ID */
  buildingFloorZoneId?: number;
  /** 푸시 알림 여부 */
  isAlertPush?: boolean;
}

/**
 * 팀 정보
 */
export interface TeamInfo {
  /** 팀 ID */
  id: number | string;
  /** 팀명 */
  name: string;
}
