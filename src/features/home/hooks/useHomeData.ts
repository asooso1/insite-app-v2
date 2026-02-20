/**
 * 홈 화면 데이터 훅
 *
 * Mock 데이터 대신 실제 API를 사용하여 홈 화면 데이터를 조회
 * - 작업지시 상태별 건수 (오늘 기준)
 * - 업무 건수 (승인대기, 내 업무, 지연)
 * - 진행 중인 작업 (최신 1건)
 * - 순찰 목록 (활성 순찰)
 */
import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  useGetWorkOrderStatePerCount,
  useGetWorkOrderList,
} from '@/api/generated/work-order/work-order';
import { useGetTaskCount } from '@/api/generated/tasks/tasks';
import { useGetPatrolList } from '@/api/generated/patrol/patrol';
import { GetWorkOrderListState } from '@/api/generated/models/getWorkOrderListState';
import { PatrolDetailDTOState } from '@/api/generated/models/patrolDetailDTOState';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useHomeData() {
  const user = useAuthStore((s) => s.user);

  const buildingId = useMemo(() => {
    const bid =
      user?.selectedBuildingAccountDTO?.buildingId ??
      user?.buildingAccountDTO?.[0]?.buildingId;
    return bid ? Number(bid) : 0;
  }, [user]);

  const today = useMemo(() => formatDate(new Date()), []);
  const enabled = buildingId > 0;

  // 1. 작업지시 상태별 건수 (오늘 기준)
  const workOrderStats = useGetWorkOrderStatePerCount(
    { buildingId, termDateFrom: today, termDateTo: today },
    { query: { enabled } },
  );

  // 2. 업무 건수 (승인대기, 내 업무, 지연)
  const taskCount = useGetTaskCount(
    { buildingId },
    { query: { enabled } },
  );

  // 3. 진행 중인 작업 (최신 1건)
  const inProgressWorkOrders = useGetWorkOrderList(
    {
      buildingId,
      state: GetWorkOrderListState.PROCESSING,
      page: 0,
      size: 1,
    },
    { query: { enabled } },
  );

  // 4. 순찰 목록 (최신 5건)
  const patrols = useGetPatrolList(
    { buildingId, page: 0, size: 5 },
    { query: { enabled } },
  );

  // 오늘의 업무 현황 파생 데이터
  const todayStats = useMemo(() => {
    const items = workOrderStats.data?.data ?? [];
    const getCount = (state: string) =>
      items.find((i) => i.state === state)?.cnt ?? 0;

    const activeWork =
      getCount('ISSUE') + getCount('PROCESSING') + getCount('REQ_COMPLETE');
    const completed = getCount('COMPLETE');

    // 순찰: ISSUE 또는 PROCESSING 상태인 것만
    const patrolList = patrols.data?.data?.content ?? [];
    const activePatrols = patrolList.filter(
      (p) =>
        p.state === PatrolDetailDTOState.ISSUE ||
        p.state === PatrolDetailDTOState.PROCESSING,
    ).length;

    // 승인대기 건수
    const pendingApproval = taskCount.data?.data?.confirmCount ?? 0;

    return {
      work: activeWork,
      patrol: activePatrols,
      approval: pendingApproval,
      completed,
    };
  }, [workOrderStats.data, patrols.data, taskCount.data]);

  // 진행 중인 작업 카드 데이터
  const inProgressWork = useMemo(() => {
    const items = inProgressWorkOrders.data?.data?.content;
    const first = items?.[0];
    if (!first) return null;
    return {
      id: first.id,
      title: first.name,
      location: first.buildingName ?? '',
    };
  }, [inProgressWorkOrders.data]);

  // 오늘의 순찰 데이터 (활성 순찰 1건)
  const todayPatrol = useMemo(() => {
    const patrolList = patrols.data?.data?.content ?? [];
    const activePatrol = patrolList.find(
      (p) =>
        p.state === PatrolDetailDTOState.ISSUE ||
        p.state === PatrolDetailDTOState.PROCESSING,
    );
    if (!activePatrol) return null;
    return {
      id: activePatrol.nfcRoundId,
      title: activePatrol.roundName ?? '순찰점검',
      building: activePatrol.buildingName,
    };
  }, [patrols.data]);

  const isLoading =
    workOrderStats.isLoading ||
    taskCount.isLoading ||
    inProgressWorkOrders.isLoading ||
    patrols.isLoading;

  const refetchAll = async () => {
    await Promise.all([
      workOrderStats.refetch(),
      taskCount.refetch(),
      inProgressWorkOrders.refetch(),
      patrols.refetch(),
    ]);
  };

  return {
    todayStats,
    inProgressWork,
    todayPatrol,
    isLoading,
    refetchAll,
    buildingId,
  };
}
