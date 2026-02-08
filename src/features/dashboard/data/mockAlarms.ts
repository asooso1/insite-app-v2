/**
 * 알람 Mock 데이터
 */
import type { AlarmDTO, AlarmStats } from '../types/alarm.types';

/**
 * Mock 알람 목록
 */
export const mockAlarms: AlarmDTO[] = [
  {
    id: 1,
    title: '화재 감지기 이상',
    description: 'A동 3층 화재감지기 통신 이상',
    severity: 'CRITICAL',
    buildingName: 'A동',
    floorName: '3층',
    zoneName: '사무실',
    occurredAt: '2026-02-08T14:30:00+09:00',
    isAcknowledged: false,
  },
  {
    id: 2,
    title: '공조기 필터 교체 필요',
    description: 'B동 1층 공조기 필터 수명 도달',
    severity: 'WARNING',
    buildingName: 'B동',
    floorName: '1층',
    zoneName: '로비',
    occurredAt: '2026-02-08T10:15:00+09:00',
    isAcknowledged: true,
  },
  {
    id: 3,
    title: '엘리베이터 정기점검 예정',
    description: 'C동 엘리베이터 정기점검 예정 알림',
    severity: 'INFO',
    buildingName: 'C동',
    floorName: '전체',
    zoneName: '엘리베이터',
    occurredAt: '2026-02-08T09:00:00+09:00',
    isAcknowledged: true,
  },
  {
    id: 4,
    title: '비상구 문 열림 감지',
    description: 'A동 2층 비상구 문이 열려있습니다',
    severity: 'WARNING',
    buildingName: 'A동',
    floorName: '2층',
    zoneName: '비상구',
    occurredAt: '2026-02-08T13:45:00+09:00',
    isAcknowledged: false,
  },
  {
    id: 5,
    title: '누수 감지',
    description: 'D동 지하1층 화장실 누수 감지',
    severity: 'CRITICAL',
    buildingName: 'D동',
    floorName: '지하1층',
    zoneName: '화장실',
    occurredAt: '2026-02-08T15:20:00+09:00',
    isAcknowledged: false,
  },
  {
    id: 6,
    title: '조명 전구 교체 필요',
    description: 'B동 4층 복도 조명 수명 도달',
    severity: 'INFO',
    buildingName: 'B동',
    floorName: '4층',
    zoneName: '복도',
    occurredAt: '2026-02-08T08:30:00+09:00',
    isAcknowledged: true,
  },
  {
    id: 7,
    title: '주차장 차단기 오류',
    description: 'A동 지하주차장 차단기 동작 오류',
    severity: 'WARNING',
    buildingName: 'A동',
    floorName: '지하1층',
    zoneName: '주차장',
    occurredAt: '2026-02-08T11:00:00+09:00',
    isAcknowledged: false,
  },
  {
    id: 8,
    title: '보일러 압력 이상',
    description: 'C동 기계실 보일러 압력 이상 감지',
    severity: 'CRITICAL',
    buildingName: 'C동',
    floorName: '지하2층',
    zoneName: '기계실',
    occurredAt: '2026-02-08T15:50:00+09:00',
    isAcknowledged: false,
  },
];

/**
 * Mock 알람 통계 계산
 */
export function calculateAlarmStats(alarms: AlarmDTO[]): AlarmStats {
  return {
    total: alarms.length,
    critical: alarms.filter((a) => a.severity === 'CRITICAL').length,
    warning: alarms.filter((a) => a.severity === 'WARNING').length,
    info: alarms.filter((a) => a.severity === 'INFO').length,
    unacknowledged: alarms.filter((a) => !a.isAcknowledged).length,
  };
}

/**
 * Mock 알람 통계
 */
export const mockAlarmStats: AlarmStats = calculateAlarmStats(mockAlarms);
