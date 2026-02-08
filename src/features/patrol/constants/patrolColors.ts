/**
 * 순찰 상태별 색상 정의
 */
import type { PatrolState, CheckpointStatus } from '../types/patrol.types';

/**
 * 순찰 상태별 배경 색상
 */
export const PATROL_STATUS_COLORS: Record<PatrolState, string> = {
  ISSUE: '#5A98DA', // 미실시 - 파랑
  PROCESSING: '#FF9800', // 진행중 - 주황
  COMPLETED: '#4CAF50', // 완료 - 녹색
};

/**
 * 순찰 상태별 텍스트 색상 (모두 흰색)
 */
export const PATROL_STATUS_TEXT_COLORS: Record<PatrolState, string> = {
  ISSUE: '#FFFFFF',
  PROCESSING: '#FFFFFF',
  COMPLETED: '#FFFFFF',
};

/**
 * 체크포인트 상태별 정보
 */
export const CHECKPOINT_STATUS_INFO: Record<
  CheckpointStatus,
  { color: string; icon: string; label: string }
> = {
  PENDING: { color: '#9E9E9E', icon: '○', label: '미점검' },
  IN_PROGRESS: { color: '#FF9800', icon: '◐', label: '진행중' },
  COMPLETED: { color: '#4CAF50', icon: '●', label: '완료' },
};

/**
 * 상태별 배경 색상 가져오기
 */
export function getPatrolStatusBgColor(state: PatrolState): string {
  return PATROL_STATUS_COLORS[state] || '#6B7280'; // 기본값: gray500
}

/**
 * 상태별 텍스트 색상 가져오기
 */
export function getPatrolStatusTextColor(state: PatrolState): string {
  return PATROL_STATUS_TEXT_COLORS[state] || '#FFFFFF';
}

/**
 * 체크포인트 상태 정보 가져오기
 */
export function getCheckpointStatusInfo(status: CheckpointStatus) {
  return CHECKPOINT_STATUS_INFO[status] || CHECKPOINT_STATUS_INFO.PENDING;
}
