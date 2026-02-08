/**
 * 대시보드 타입 정의
 */

/**
 * 작업 통계
 */
export interface WorkStats {
  /** 총 작업 수 */
  total: number;
  /** 완료된 작업 수 */
  completed: number;
  /** 진행중인 작업 수 */
  processing: number;
  /** 대기중인 작업 수 */
  pending: number;
}

/**
 * 순찰 통계
 */
export interface PatrolStats {
  /** 총 순찰 수 */
  total: number;
  /** 완료된 순찰 수 */
  completed: number;
  /** 진행중인 순찰 수 */
  processing: number;
  /** 미실시 순찰 수 */
  notStarted: number;
}

/**
 * 주간 추세 데이터
 */
export interface WeeklyTrendItem {
  /** 요일 */
  day: string;
  /** 작업 수 */
  work: number;
  /** 순찰 수 */
  patrol: number;
}

/**
 * 대시보드 통계 데이터
 */
export interface DashboardStats {
  /** 작업 통계 */
  work: WorkStats;
  /** 순찰 통계 */
  patrol: PatrolStats;
  /** 주간 추세 */
  weeklyTrend: WeeklyTrendItem[];
}

/**
 * 통계 카드 데이터
 */
export interface StatCardData {
  /** 제목 */
  title: string;
  /** 주요 수치 */
  value: number;
  /** 총 수량 */
  total: number;
  /** 변화율 (선택) */
  change?: number;
  /** 카드 색상 */
  color: string;
}
