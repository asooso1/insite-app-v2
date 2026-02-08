/**
 * 순찰 관련 타입 정의
 */

/**
 * 순찰 상태
 */
export type PatrolState = 'ISSUE' | 'PROCESSING' | 'COMPLETED';

/**
 * 순찰 필터 옵션
 */
export type PatrolFilterOption = 'ALL' | PatrolState;

/**
 * 체크포인트 상태
 */
export type CheckpointStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * 순찰 DTO
 */
export interface PatrolDTO {
  /** 순찰 ID */
  id: number;
  /** 순찰명 */
  name: string;
  /** 상태 코드 */
  state: PatrolState;
  /** 상태명 */
  stateName: string;
  /** 건물명 */
  buildingName: string;
  /** 총 층 수 */
  floorCount: number;
  /** 완료된 층 수 */
  completedFloors: number;
  /** 총 체크포인트 수 */
  totalCheckpoints: number;
  /** 완료된 체크포인트 수 */
  completedCheckpoints: number;
  /** 예정 날짜 (YYYY-MM-DD) */
  scheduledDate: string;
  /** 오늘 날짜 여부 */
  isToday: boolean;
}

/**
 * 체크포인트 DTO
 */
export interface CheckpointDTO {
  /** 체크포인트 ID */
  id: number;
  /** 체크포인트 이름 */
  name: string;
  /** 상태 */
  status: CheckpointStatus;
  /** 점검 항목 수 */
  itemCount: number;
  /** 완료된 점검 항목 수 */
  completedItemCount: number;
}

/**
 * 구역 DTO
 */
export interface ZoneDTO {
  /** 구역 ID */
  buildingFloorZoneId: number;
  /** 구역명 */
  buildingFloorZoneName: string;
  /** 완료 여부 */
  isCompleted: boolean;
  /** 체크포인트 목록 */
  checkpoints: CheckpointDTO[];
}

/**
 * 층 DTO
 */
export interface FloorDTO {
  /** 층 ID */
  buildingFloorId: number;
  /** 층명 */
  buildingFloorName: string;
  /** 구역 목록 */
  zones: ZoneDTO[];
  /** 완료율 (0-100) */
  completionRate: number;
}

/**
 * 순찰 상세 DTO
 */
export interface PatrolDetailDTO extends PatrolDTO {
  /** 층별 데이터 */
  floors: FloorDTO[];
}
