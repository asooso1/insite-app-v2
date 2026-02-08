/**
 * 알람 심각도별 색상 및 레이블 상수
 */
import type { AlarmSeverity } from '../types/alarm.types';

/**
 * 알람 심각도 메타 정보
 */
interface AlarmSeverityMeta {
  color: string;
  label: string;
  icon: string;
  bgColor: string;
}

/**
 * 알람 심각도별 색상 맵
 */
export const ALARM_SEVERITY_MAP: Record<AlarmSeverity, AlarmSeverityMeta> = {
  CRITICAL: {
    color: '#DC2626', // error
    label: '심각',
    icon: '🔴',
    bgColor: '#FEE2E2', // error light bg
  },
  WARNING: {
    color: '#F59E0B', // warning (조정)
    label: '경고',
    icon: '🟠',
    bgColor: '#FEF3C7', // warning light bg
  },
  INFO: {
    color: '#3B82F6', // info (조정)
    label: '정보',
    icon: '🔵',
    bgColor: '#DBEAFE', // info light bg
  },
};

/**
 * 심각도별 색상 반환
 */
export function getAlarmSeverityColor(severity: AlarmSeverity): string {
  return ALARM_SEVERITY_MAP[severity].color;
}

/**
 * 심각도별 배경 색상 반환
 */
export function getAlarmSeverityBgColor(severity: AlarmSeverity): string {
  return ALARM_SEVERITY_MAP[severity].bgColor;
}

/**
 * 심각도별 레이블 반환
 */
export function getAlarmSeverityLabel(severity: AlarmSeverity): string {
  return ALARM_SEVERITY_MAP[severity].label;
}

/**
 * 심각도별 아이콘 반환
 */
export function getAlarmSeverityIcon(severity: AlarmSeverity): string {
  return ALARM_SEVERITY_MAP[severity].icon;
}
