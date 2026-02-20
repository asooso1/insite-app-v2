/**
 * usePermission 훅 단위 테스트
 *
 * 순수 함수 getRoleGroup 및 권한 시스템 검증
 */
import { getRoleGroup } from '../usePermission';
import { ROLE_PERMISSIONS, ADMIN_ROLE_IDS, WORKER_ROLE_IDS, PARTNER_ROLE_IDS } from '@/types/permission.types';

describe('getRoleGroup', () => {
  it('undefined 입력 시 EXTERNAL을 반환한다', () => {
    expect(getRoleGroup(undefined)).toBe('EXTERNAL');
  });

  it('0 입력 시 EXTERNAL을 반환한다', () => {
    expect(getRoleGroup(0)).toBe('EXTERNAL');
  });

  describe('ADMIN 역할', () => {
    it.each([1, 3, 9, 10])('roleId %d는 ADMIN을 반환한다', (roleId) => {
      expect(getRoleGroup(roleId)).toBe('ADMIN');
    });
  });

  describe('WORKER 역할', () => {
    it.each([12, 14, 20])('roleId %d는 WORKER를 반환한다', (roleId) => {
      expect(getRoleGroup(roleId)).toBe('WORKER');
    });
  });

  describe('PARTNER 역할', () => {
    it.each([15, 16, 19])('roleId %d는 PARTNER를 반환한다', (roleId) => {
      expect(getRoleGroup(roleId)).toBe('PARTNER');
    });
  });

  describe('EXTERNAL 역할', () => {
    it.each([17, 18, 21])('roleId %d는 EXTERNAL을 반환한다', (roleId) => {
      expect(getRoleGroup(roleId)).toBe('EXTERNAL');
    });
  });

  it('정의되지 않은 roleId는 EXTERNAL을 반환한다', () => {
    expect(getRoleGroup(999)).toBe('EXTERNAL');
  });
});

describe('ROLE_PERMISSIONS 일관성', () => {
  it('ADMIN은 모든 기본 권한을 가진다', () => {
    const adminPerms = ROLE_PERMISSIONS.ADMIN;
    expect(adminPerms).toContain('myTask');
    expect(adminPerms).toContain('approval');
    expect(adminPerms).toContain('workOrder');
    expect(adminPerms).toContain('workOrderCreate');
    expect(adminPerms).toContain('patrol');
    expect(adminPerms).toContain('patrolAdmin');
    expect(adminPerms).toContain('dashboard');
    expect(adminPerms).toContain('tabMyWork');
    expect(adminPerms).toContain('tabScan');
    expect(adminPerms).toContain('tabCalendar');
    expect(adminPerms).toContain('qrAttendance');
  });

  it('WORKER는 승인 권한이 없다', () => {
    const workerPerms = ROLE_PERMISSIONS.WORKER;
    expect(workerPerms).not.toContain('approval');
    expect(workerPerms).not.toContain('dashboard');
    expect(workerPerms).toContain('myTask');
    expect(workerPerms).toContain('patrol');
    expect(workerPerms).toContain('tabMyWork');
  });

  it('PARTNER는 탭 접근이 제한적이다 (내 작업/스캔/캘린더 탭 없음)', () => {
    const partnerPerms = ROLE_PERMISSIONS.PARTNER;
    expect(partnerPerms).not.toContain('tabMyWork');
    expect(partnerPerms).not.toContain('tabScan');
    expect(partnerPerms).not.toContain('tabCalendar');
    expect(partnerPerms).toContain('approval');
    expect(partnerPerms).toContain('dashboard');
  });

  it('EXTERNAL은 고객불편만 접근 가능하다', () => {
    const externalPerms = ROLE_PERMISSIONS.EXTERNAL;
    expect(externalPerms).toContain('claim');
    expect(externalPerms).toContain('claimCreate');
    expect(externalPerms).toHaveLength(2);
  });
});

describe('역할 ID 배열 일관성', () => {
  it('역할 ID가 중복되지 않는다', () => {
    const allIds = [...ADMIN_ROLE_IDS, ...WORKER_ROLE_IDS, ...PARTNER_ROLE_IDS];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('ADMIN에 시스템관리자(1), 본사관리자(3), 현장소장(9), 현장관리자(10)가 포함된다', () => {
    expect(ADMIN_ROLE_IDS).toEqual(expect.arrayContaining([1, 3, 9, 10]));
    expect(ADMIN_ROLE_IDS).toHaveLength(4);
  });

  it('WORKER에 시설팀원(12), 미화팀원(14), 보안팀원(20)이 포함된다', () => {
    expect(WORKER_ROLE_IDS).toEqual(expect.arrayContaining([12, 14, 20]));
    expect(WORKER_ROLE_IDS).toHaveLength(3);
  });
});
