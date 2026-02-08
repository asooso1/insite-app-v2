/**
 * 순찰점검 타입 정의
 *
 * @description 순찰점검 관련 타입을 정의합니다
 */

import type {
  PatrolDetailDTO,
  PatrolFloorDTO,
  PatrolZoneDTO,
  PatrolItemDTO,
  PatrolResultItemDTO,
  PatrolResultImageDTO,
} from '@/api/generated/models';

// 생성된 타입을 re-export
export type {
  PatrolDetailDTO,
  PatrolFloorDTO,
  PatrolZoneDTO,
  PatrolItemDTO,
  PatrolResultItemDTO,
  PatrolResultImageDTO,
};

/**
 * 순찰 상태
 */
export enum PatrolState {
  WRITE = 'WRITE', // 작성중
  ISSUE = 'ISSUE', // 발행
  PROCESSING = 'PROCESSING', // 진행중
  REQ_COMPLETE = 'REQ_COMPLETE', // 완료요청
  COMPLETE = 'COMPLETE', // 완료
}

/**
 * 조치 유형
 */
export enum ActionType {
  NONE = 'NONE', // 양호 (조치 불필요)
  ON_SITE = 'ON_SITE', // 현장 조치 완료
  NOT_POSSIBLE = 'NOT_POSSIBLE', // 조치 불가
}

/**
 * 점검 항목 상태 (UI용)
 */
export interface CheckItemState {
  nfcRoundItemId: number;
  actionType: ActionType;
  actionTaken: string;
  images: File[];
  deletedImageIds: number[];
}

/**
 * 순찰 진행률
 */
export interface PatrolProgress {
  total: number; // 전체 구역 수
  completed: number; // 완료된 구역 수
  percentage: number; // 진행률 (0-100)
}

/**
 * 순찰 필터 옵션
 */
export interface PatrolFilterOptions {
  showOnlyIncomplete?: boolean; // 미완료 구역만 표시
  floorId?: number; // 특정 층만 표시
}
