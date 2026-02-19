/**
 * 권한 시스템 타입 정의
 *
 * V1 호환 - 13개 역할 기반
 * 참조: InsiteApp/src/constants/AppConstants.ts
 * 참조: InsiteApp/src/pages/Login/Login.js (getMenuByRole)
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
  | 18 // 입주사 (외부인)
  | 19 // 협력사
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

/** 역할 매핑 (V1 Login.js getMenuByRole 기반) */
export const ROLE_MAP: Record<RoleId, RoleInfo> = {
  1: { id: 1, name: '시스템관리자', group: 'ADMIN', description: '전체 시스템 관리 권한' },
  3: { id: 3, name: '본사관리자', group: 'ADMIN', description: '본사 관리 권한' },
  9: { id: 9, name: '현장소장', group: 'ADMIN', description: '현장 총괄 관리' },
  10: { id: 10, name: '현장관리자', group: 'ADMIN', description: '현장 팀장 권한' },
  12: { id: 12, name: '시설팀원', group: 'WORKER', description: '시설 관리 작업자' },
  14: { id: 14, name: '미화팀원', group: 'WORKER', description: '미화 작업자' },
  15: { id: 15, name: '고객사관리자', group: 'PARTNER', description: '고객사 담당자' },
  16: { id: 16, name: '건물주', group: 'PARTNER', description: '건물주 또는 입주사' },
  17: { id: 17, name: '민원인', group: 'EXTERNAL', description: '외부 민원인' },
  18: { id: 18, name: '입주사', group: 'EXTERNAL', description: '입주사 담당자' },
  19: { id: 19, name: '협력사', group: 'PARTNER', description: '협력사 담당자' },
  20: { id: 20, name: '보안팀원', group: 'WORKER', description: '보안 작업자' },
  21: { id: 21, name: '일일계정', group: 'EXTERNAL', description: '임시 계정' },
};

/** 관리자 역할 IDs - 전체 기능 접근 */
export const ADMIN_ROLE_IDS: RoleId[] = [1, 3, 9, 10];

/** 작업자 역할 IDs - 작업 실행 권한 */
export const WORKER_ROLE_IDS: RoleId[] = [12, 14, 20];

/** 파트너 역할 IDs - 승인/대시보드 접근 */
export const PARTNER_ROLE_IDS: RoleId[] = [15, 16, 19];

/** 외부 역할 IDs - 제한적 접근 */
export const EXTERNAL_ROLE_IDS: RoleId[] = [17, 18, 21];

/**
 * 권한 타입
 * V1 메뉴 기반 권한 정의
 */
export type Permission =
  // 홈 메뉴 접근 권한
  | 'myTask' // 내 업무 (MyTaskList)
  | 'approval' // 승인/확인 (ApprovalList)
  | 'personalTask' // 일상업무 현황
  | 'personalTaskCreate' // 일상업무 등록
  | 'workOrder' // 수시업무 현황
  | 'workOrderCreate' // 수시업무 등록
  | 'patrol' // 순찰점검
  | 'patrolAdmin' // 순찰점검 현황 (관리자)
  | 'facility' // 설비정보 조회
  | 'claim' // 고객불편 목록
  | 'claimCreate' // 고객불편 등록
  | 'dashboard' // 운영 대시보드
  | 'dashboardAlarm' // 경보 대시보드
  | 'dashboardSite' // 현장 대시보드
  | 'dashboardNcp' // NCP 대시보드
  // 탭 접근 권한
  | 'tabMyWork' // 내 작업 탭
  | 'tabScan' // 스캔 탭
  | 'tabCalendar' // 캘린더 탭
  // 기능 권한
  | 'qrAttendance'; // 출퇴근 QR

/**
 * 역할별 권한 매핑
 * V1 AppConstants.ts 메뉴 구성 기반
 */
export const ROLE_PERMISSIONS: Record<RoleGroup, Permission[]> = {
  // 시스템관리자, 본사관리자, 현장소장, 현장관리자
  ADMIN: [
    // 홈 메뉴
    'myTask',
    'approval',
    'personalTask',
    'personalTaskCreate',
    'workOrder',
    'workOrderCreate',
    'patrol',
    'patrolAdmin',
    'facility',
    'claim',
    'claimCreate',
    'dashboard',
    'dashboardAlarm',
    'dashboardSite',
    'dashboardNcp',
    // 탭
    'tabMyWork',
    'tabScan',
    'tabCalendar',
    // 기능
    'qrAttendance',
  ],
  // 시설팀원, 미화팀원, 보안팀원
  WORKER: [
    // 홈 메뉴
    'myTask',
    'personalTask',
    'personalTaskCreate',
    'patrol',
    'facility',
    'claim',
    'claimCreate',
    'dashboardAlarm',
    // 탭
    'tabMyWork',
    'tabScan',
    'tabCalendar',
    // 기능
    'qrAttendance',
  ],
  // 고객사관리자, 건물주, 협력사
  PARTNER: [
    // 홈 메뉴
    'approval',
    'claim',
    'claimCreate',
    'dashboard',
    'dashboardAlarm',
    'dashboardSite',
    'dashboardNcp',
    // 탭 - 홈/설정만
    // 기능 없음
  ],
  // 민원인, 입주사, 일일계정
  EXTERNAL: [
    // 홈 메뉴 - 고객불편만
    'claim',
    'claimCreate',
    // 탭 - 홈/설정만
    // 기능 없음
  ],
};

/** 탭 아이콘 타입 */
export type TabIconName = 'home' | 'work' | 'scan' | 'calendar' | 'settings';

/** 탭 구성 타입 */
export interface TabConfig {
  name: string;
  title: string;
  icon: TabIconName;
  href: string;
}

/**
 * 역할별 탭 구성
 * V1 MainContainer.js 기반
 *
 * - ADMIN/WORKER: 전체 5개 탭
 * - PARTNER/EXTERNAL: 홈 + 설정만 (2개 탭)
 */
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
    { name: '(settings)', title: '설정', icon: 'settings', href: '/(main)/(settings)' },
  ],
  EXTERNAL: [
    { name: '(home)', title: '홈', icon: 'home', href: '/(main)/(home)' },
    { name: '(settings)', title: '설정', icon: 'settings', href: '/(main)/(settings)' },
  ],
};

/**
 * 홈 화면 메뉴 아이템 타입
 */
export interface HomeMenuItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  permission: Permission;
  color: string;
  isDefault: boolean; // 기본 활성화 여부
}

/**
 * 홈 화면 메뉴 정의
 * V1 AppConstants.ts MenuTemplates 기반
 */
export const HOME_MENU_ITEMS: HomeMenuItem[] = [
  // 내업무/승인
  {
    id: 'myTask',
    title: '내업무',
    icon: 'clipboard-list',
    route: '/(main)/(my-work)',
    permission: 'myTask',
    color: '#5856D6',
    isDefault: true,
  },
  {
    id: 'approval',
    title: '승인/확인',
    icon: 'check-circle',
    route: '/(main)/(home)/approval',
    permission: 'approval',
    color: '#5856D6',
    isDefault: true,
  },
  // 일상업무
  {
    id: 'personalTaskCreate',
    title: '일상업무등록',
    icon: 'plus-circle',
    route: '/(main)/(home)/personal-task/create',
    permission: 'personalTaskCreate',
    color: '#34C759',
    isDefault: true,
  },
  {
    id: 'personalTask',
    title: '일상업무현황',
    icon: 'list',
    route: '/(main)/(home)/personal-task',
    permission: 'personalTask',
    color: '#34C759',
    isDefault: true,
  },
  // 고객불편
  {
    id: 'claimCreate',
    title: '고객불편등록',
    icon: 'alert-circle',
    route: '/(main)/(home)/claim/create',
    permission: 'claimCreate',
    color: '#FF9500',
    isDefault: true,
  },
  {
    id: 'claim',
    title: '고객불편목록',
    icon: 'message-square',
    route: '/(main)/(home)/claim',
    permission: 'claim',
    color: '#FF9500',
    isDefault: true,
  },
  // 수시업무
  {
    id: 'workOrderCreate',
    title: '수시업무등록',
    icon: 'file-plus',
    route: '/(main)/(home)/work/create',
    permission: 'workOrderCreate',
    color: '#007AFF',
    isDefault: true,
  },
  {
    id: 'workOrder',
    title: '수시업무현황',
    icon: 'file-text',
    route: '/(main)/(home)/work',
    permission: 'workOrder',
    color: '#007AFF',
    isDefault: true,
  },
  // 설비정보
  {
    id: 'facility',
    title: '설비정보조회',
    icon: 'settings',
    route: '/(main)/(home)/facility',
    permission: 'facility',
    color: '#8E8E93',
    isDefault: true,
  },
  // 순찰점검
  {
    id: 'patrol',
    title: '순찰점검',
    icon: 'shield',
    route: '/(main)/(home)/patrol',
    permission: 'patrol',
    color: '#34C759',
    isDefault: true,
  },
  {
    id: 'patrolAdmin',
    title: '순찰점검 현황',
    icon: 'shield-check',
    route: '/(main)/(home)/patrol/admin',
    permission: 'patrolAdmin',
    color: '#34C759',
    isDefault: true,
  },
  // 대시보드
  {
    id: 'dashboardAlarm',
    title: '경보대시보드',
    icon: 'bell',
    route: '/(main)/(home)/dashboard/alarm',
    permission: 'dashboardAlarm',
    color: '#FF3B30',
    isDefault: true,
  },
  {
    id: 'dashboard',
    title: '운영대시보드',
    icon: 'bar-chart-2',
    route: '/(main)/(home)/dashboard',
    permission: 'dashboard',
    color: '#5856D6',
    isDefault: true,
  },
  {
    id: 'dashboardSite',
    title: '현장대시보드',
    icon: 'map-pin',
    route: '/(main)/(home)/dashboard/site',
    permission: 'dashboardSite',
    color: '#5856D6',
    isDefault: true,
  },
];

/**
 * 출퇴근 QR 표시 대상 역할
 * V1 HomePage.js 라인 748-755 기반
 */
export const QR_ATTENDANCE_ROLE_IDS: RoleId[] = [1, 3, 9, 10, 12, 14, 20, 21];

/**
 * 일상업무 등록 버튼 표시 역할
 * V1 PersonalTaskList.js 라인 300 기반
 */
export const PERSONAL_TASK_CREATE_ROLE_IDS: RoleId[] = [1, 3, 9, 19];
