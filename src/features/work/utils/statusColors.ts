/**
 * 작업지시 상태별 색상 유틸리티
 */
import type { WorkOrderDTOState } from '@/api/generated/models';

/**
 * 상태별 색상 매핑
 */
export const STATUS_COLORS: Record<WorkOrderDTOState, { bg: string; text: string }> = {
  WRITE: {
    bg: '#E3F2FD',
    text: '#5A98DA',
  },
  ISSUE: {
    bg: '#E8F5E9',
    text: '#4CAF50',
  },
  PROCESSING: {
    bg: '#FFF3E0',
    text: '#FF9800',
  },
  REQ_COMPLETE: {
    bg: '#E1F5FE',
    text: '#2196F3',
  },
  COMPLETE: {
    bg: '#F1F8E9',
    text: '#8BC34A',
  },
  CANCEL: {
    bg: '#FFEBEE',
    text: '#B22222',
  },
};

/**
 * 상태에 따른 배경색 반환
 */
export function getStatusBgColor(state: WorkOrderDTOState): string {
  return STATUS_COLORS[state].bg;
}

/**
 * 상태에 따른 텍스트 색상 반환
 */
export function getStatusTextColor(state: WorkOrderDTOState): string {
  return STATUS_COLORS[state].text;
}
