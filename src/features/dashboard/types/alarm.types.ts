/**
 * 알람 타입 정의
 */

/**
 * 알람 심각도
 */
export type AlarmSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

/**
 * 알람 DTO
 */
export interface AlarmDTO {
  /** 알람 ID */
  id: number;
  /** 알람 제목 */
  title: string;
  /** 알람 상세 설명 */
  description: string;
  /** 심각도 */
  severity: AlarmSeverity;
  /** 건물명 */
  buildingName: string;
  /** 층명 */
  floorName: string;
  /** 구역명 */
  zoneName: string;
  /** 발생 시각 (ISO 8601) */
  occurredAt: string;
  /** 확인 여부 */
  isAcknowledged: boolean;
}

/**
 * 알람 통계
 */
export interface AlarmStats {
  /** 전체 알람 수 */
  total: number;
  /** 심각 알람 수 */
  critical: number;
  /** 경고 알람 수 */
  warning: number;
  /** 정보 알람 수 */
  info: number;
  /** 미확인 알람 수 */
  unacknowledged: number;
}

/**
 * 알람 필터
 */
export interface AlarmFilter {
  /** 심각도 필터 (null = 전체) */
  severity: AlarmSeverity | null;
  /** 확인 여부 필터 (null = 전체) */
  acknowledged: boolean | null;
}
