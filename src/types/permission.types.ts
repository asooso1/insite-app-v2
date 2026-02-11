/**
 * 권한 시스템 타입 정의
 *
 * V1 호환 - 13개 역할 기반
 */

/** 역할 ID (V1 호환) */
export type RoleId =
  | 1 // 시스템관리자
  | 3 // 본사관리자
  | 9 // 현장소장
  | 10 // 현장관리자 (팀장)
  | 12 // 시설팀원
  | 14 // 미화팀원
  | 15 // 고객사관리자
  | 16 // 건물주/입주사
  | 17 // 민원인 (외부인)
  | 18 // 민원인 (외부인)
  | 19 // 입주사관리자
  | 20 // 보안팀원
  | 21; // 일일계정

/** 역할 그룹 */
export type RoleGroup = 'ADMIN' | 'WORKER' | 'PARTNER' | 'EXTERNAL';

/** 역할 정보 */
export interface RoleInfo {
  id: RoleId;
  name: string;
  group: RoleGroup;
  description: string;
}

/** 역할 매핑 */
export const ROLE_MAP: Record<RoleId, RoleInfo> = {
  1: { id: 1, name: '시스템관리자', group: 'ADMIN', description: '전체 시스템 관리 권한' },
  3: { id: 3, name: '본사관리자', group: 'ADMIN', description: '본사 관리 권한' },
  9: { id: 9, name: '현장소장', group: 'ADMIN', description: '현장 총괄 관리' },
  10: { id: 10, name: '현장관리자', group: 'ADMIN', description: '현장 팀장 권한' },
  12: { id: 12, name: '시설팀원', group: 'WORKER', description: '시설 관리 작업자' },
  14: { id: 14, name: '미화팀원', group: 'WORKER', description: '미화 작업자' },
  15: { id: 15, name: '고객사관리자', group: 'PARTNER', description: '고객사 담당자' },
  16: { id: 16, name: '건물주/입주사', group: 'PARTNER', description: '건물주 또는 입주사' },
  17: { id: 17, name: '민원인', group: 'EXTERNAL', description: '외부 민원인' },
  18: { id: 18, name: '민원인', group: 'EXTERNAL', description: '외부 민원인' },
  19: { id: 19, name: '입주사관리자', group: 'PARTNER', description: '입주사 담당자' },
  20: { id: 20, name: '보안팀원', group: 'WORKER', description: '보안 작업자' },
  21: { id: 21, name: '일일계정', group: 'EXTERNAL', description: '임시 계정' },
};

/** 관리자 역할 IDs */
export const ADMIN_ROLE_IDS: RoleId[] = [1, 3, 9, 10];

/** 작업자 역할 IDs */
export const WORKER_ROLE_IDS: RoleId[] = [12, 14, 20];

/** 파트너 역할 IDs */
export const PARTNER_ROLE_IDS: RoleId[] = [15, 16, 19];

/** 외부 역할 IDs */
export const EXTERNAL_ROLE_IDS: RoleId[] = [17, 18, 21];

/** 권한 타입 */
export type Permission =
  | 'myTask' // 내 업무
  | 'approval' // 승인/확인
  | 'workOrder' // 작업지시
  | 'workOrderCreate' // 작업지시 등록
  | 'patrol' // 순찰점검
  | 'personalTask' // 일상업무
  | 'personalTaskCreate' // 일상업무 등록
  | 'facility' // 설비정보
  | 'claim' // 고객불편
  | 'claimCreate' // 고객불편 등록
  | 'dashboard' // 대시보드
  | 'alarm' // 알람
  | 'bems' // BEMS
  | 'scan'; // 스캔

/** 역할별 권한 매핑 */
export const ROLE_PERMISSIONS: Record<RoleGroup, Permission[]> = {
  ADMIN: [
    'myTask',
    'approval',
    'workOrder',
    'workOrderCreate',
    'patrol',
    'personalTask',
    'personalTaskCreate',
    'facility',
    'claim',
    'claimCreate',
    'dashboard',
    'alarm',
    'bems',
    'scan',
  ],
  WORKER: [
    'myTask',
    'patrol',
    'personalTask',
    'personalTaskCreate',
    'facility',
    'claim',
    'claimCreate',
    'alarm',
    'scan',
  ],
  PARTNER: ['approval', 'claim', 'claimCreate', 'dashboard', 'alarm', 'bems'],
  EXTERNAL: ['claim', 'claimCreate'],
};

/** 탭 구성 타입 */
export interface TabConfig {
  name: string;
  title: string;
  icon: string;
  href: string;
}

/** 역할별 탭 구성 */
export const ROLE_TABS: Record<RoleGroup, TabConfig[]> = {
  ADMIN: [
    { name: '(home)', title: '홈', icon: 'home', href: '/(main)/(home)' },
    { name: '(my-work)', title: '내 작업', icon: 'work', href: '/(main)/(my-work)' },
    { name: '(scan)', title: '스캔', icon: 'scan', href: '/(main)/(scan)' },
    { name: '(calendar)', title: '캘린더', icon: 'calendar', href: '/(main)/(calendar)' },
    { name: '(settings)', title: '설정', icon: 'settings', href: '/(main)/(settings)' },
  ],
  WORKER: [
    { name: '(home)', title: '홈', icon: 'home', href: '/(main)/(home)' },
    { name: '(my-work)', title: '내 작업', icon: 'work', href: '/(main)/(my-work)' },
    { name: '(scan)', title: '스캔', icon: 'scan', href: '/(main)/(scan)' },
    { name: '(calendar)', title: '캘린더', icon: 'calendar', href: '/(main)/(calendar)' },
    { name: '(settings)', title: '설정', icon: 'settings', href: '/(main)/(settings)' },
  ],
  PARTNER: [
    { name: '(home)', title: '홈', icon: 'home', href: '/(main)/(home)' },
    { name: '(my-work)', title: '내 작업', icon: 'work', href: '/(main)/(my-work)' },
    { name: '(scan)', title: '스캔', icon: 'scan', href: '/(main)/(scan)' },
    { name: '(calendar)', title: '캘린더', icon: 'calendar', href: '/(main)/(calendar)' },
    { name: '(settings)', title: '설정', icon: 'settings', href: '/(main)/(settings)' },
  ],
  EXTERNAL: [
    { name: '(home)', title: '홈', icon: 'home', href: '/(main)/(home)' },
    { name: '(settings)', title: '설정', icon: 'settings', href: '/(main)/(settings)' },
  ],
};
