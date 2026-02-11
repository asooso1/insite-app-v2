/**
 * 권한 체크 훅
 *
 * 사용자 역할에 따른 권한 확인
 */
import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  type RoleId,
  type RoleGroup,
  type Permission,
  type TabConfig,
  ROLE_MAP,
  ADMIN_ROLE_IDS,
  WORKER_ROLE_IDS,
  PARTNER_ROLE_IDS,
  ROLE_PERMISSIONS,
  ROLE_TABS,
} from '@/types/permission.types';

/**
 * 역할 ID로 역할 그룹 반환
 */
export function getRoleGroup(roleId: number | undefined): RoleGroup {
  if (!roleId) return 'EXTERNAL';

  if (ADMIN_ROLE_IDS.includes(roleId as RoleId)) return 'ADMIN';
  if (WORKER_ROLE_IDS.includes(roleId as RoleId)) return 'WORKER';
  if (PARTNER_ROLE_IDS.includes(roleId as RoleId)) return 'PARTNER';

  return 'EXTERNAL';
}

/**
 * 권한 체크 훅
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const roleId = user?.roleId as RoleId | undefined;

  const roleGroup = useMemo(() => getRoleGroup(roleId), [roleId]);

  const roleInfo = useMemo(() => {
    if (!roleId) return null;
    return ROLE_MAP[roleId] || null;
  }, [roleId]);

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[roleGroup] || [];
  }, [roleGroup]);

  const tabs = useMemo(() => {
    return ROLE_TABS[roleGroup] || ROLE_TABS.EXTERNAL;
  }, [roleGroup]);

  /**
   * 특정 권한 보유 여부 확인
   */
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  /**
   * 관리자 여부
   */
  const isAdmin = roleGroup === 'ADMIN';

  /**
   * 작업자 여부
   */
  const isWorker = roleGroup === 'WORKER';

  /**
   * 파트너 여부
   */
  const isPartner = roleGroup === 'PARTNER';

  /**
   * 외부 사용자 여부
   */
  const isExternal = roleGroup === 'EXTERNAL';

  /**
   * 승인 권한 보유 여부
   */
  const canApprove = hasPermission('approval');

  /**
   * 내 업무 접근 가능 여부
   */
  const canAccessMyTask = hasPermission('myTask');

  /**
   * 대시보드 접근 가능 여부
   */
  const canAccessDashboard = hasPermission('dashboard');

  return {
    // 기본 정보
    roleId,
    roleGroup,
    roleInfo,
    permissions,
    tabs,

    // 권한 체크
    hasPermission,

    // 역할 확인
    isAdmin,
    isWorker,
    isPartner,
    isExternal,

    // 주요 권한
    canApprove,
    canAccessMyTask,
    canAccessDashboard,
  };
}

/**
 * 권한 기반 컴포넌트 표시 여부 결정
 */
export function useCanShow(permission: Permission): boolean {
  const { hasPermission } = usePermission();
  return hasPermission(permission);
}

/**
 * 역할 그룹 기반 탭 설정 반환
 */
export function useRoleTabs(): TabConfig[] {
  const { tabs } = usePermission();
  return tabs;
}

export default usePermission;
