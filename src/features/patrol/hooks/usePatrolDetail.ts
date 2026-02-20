/**
 * 순찰 상세 조회 커스텀 훅
 *
 * Orval 생성 훅을 결합하여 상세 데이터 구성:
 * - useGetPatrolDetail: 기본 순찰 정보
 * - useGetPatrolTargets: 층/구역 데이터
 * - useRequestCompletePatrol: 순찰 완료 요청
 */
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetPatrolDetail,
  useGetPatrolTargets,
  useRequestCompletePatrol,
  getGetPatrolDetailQueryKey,
  getGetPatrolListQueryKey,
} from '@/api/generated/patrol/patrol';
import type { PatrolFloorDTO as ApiPatrolFloorDTO } from '@/api/generated/models/patrolFloorDTO';
import type {
  PatrolDetailDTO,
  FloorDTO,
  ZoneDTO,
  CheckpointDTO,
} from '../types/patrol.types';

interface UsePatrolDetailOptions {
  nfcRoundId: number;
  enabled?: boolean;
}

/**
 * API 상태 → 커스텀 상태 매핑
 */
function mapState(apiState: string): PatrolDetailDTO['state'] {
  switch (apiState) {
    case 'COMPLETE':
      return 'COMPLETED';
    case 'PROCESSING':
      return 'PROCESSING';
    default:
      return 'ISSUE';
  }
}

function mapStateName(state: PatrolDetailDTO['state']): string {
  switch (state) {
    case 'COMPLETED':
      return '완료';
    case 'PROCESSING':
      return '진행중';
    default:
      return '미실시';
  }
}

/**
 * API 층 데이터 → 커스텀 FloorDTO 매핑
 */
function mapFloor(apiFloor: ApiPatrolFloorDTO): FloorDTO {
  const zones: ZoneDTO[] = (apiFloor.nfcRoundTargetDTOS ?? []).map((zone) => {
    const checkpoint: CheckpointDTO = {
      id: zone.buildingFloorZoneId,
      name: zone.buildingFloorZoneName,
      status: zone.isCompleted ? 'COMPLETED' : 'PENDING',
      itemCount: 1,
      completedItemCount: zone.isCompleted ? 1 : 0,
    };

    return {
      buildingFloorZoneId: zone.buildingFloorZoneId,
      buildingFloorZoneName: zone.buildingFloorZoneName,
      isCompleted: zone.isCompleted,
      checkpoints: [checkpoint],
    };
  });

  const completedZones = zones.filter((z) => z.isCompleted).length;
  const completionRate = zones.length > 0 ? Math.round((completedZones / zones.length) * 100) : 0;

  return {
    buildingFloorId: apiFloor.buildingFloorId,
    buildingFloorName: apiFloor.buildingFloorName,
    zones,
    completionRate,
  };
}

/**
 * 순찰 상세 조회 훅
 */
export function usePatrolDetail({ nfcRoundId, enabled = true }: UsePatrolDetailOptions) {
  const queryClient = useQueryClient();

  // 기본 순찰 정보
  const detailQuery = useGetPatrolDetail(nfcRoundId, {
    query: {
      enabled: enabled && nfcRoundId > 0,
      staleTime: 1000 * 60 * 5,
    },
  });

  // 층/구역 데이터
  const targetsQuery = useGetPatrolTargets(
    { nfcRoundId },
    {
      query: {
        enabled: enabled && nfcRoundId > 0,
        staleTime: 1000 * 60 * 5,
      },
    },
  );

  // 순찰 완료 요청 mutation
  const completeMutation = useRequestCompletePatrol({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetPatrolDetailQueryKey(nfcRoundId),
        });
        queryClient.invalidateQueries({
          queryKey: getGetPatrolListQueryKey(),
        });
      },
    },
  });

  // 결합된 상세 데이터 생성
  const patrolDetail = useMemo<PatrolDetailDTO | null>(() => {
    const detail = detailQuery.data?.data;
    if (!detail) return null;

    const apiFloors = targetsQuery.data?.data ?? [];
    const floors = apiFloors.map(mapFloor);

    const state = mapState(detail.state);
    const today = new Date().toISOString().split('T')[0] ?? '';
    const startDate = detail.startDate?.split('T')[0] ?? today;

    // 통계 계산
    const totalZones = floors.reduce((sum, f) => sum + f.zones.length, 0);
    const completedZones = floors.reduce(
      (sum, f) => sum + f.zones.filter((z) => z.isCompleted).length,
      0,
    );
    const completedFloors = floors.filter((f) => f.completionRate === 100).length;

    return {
      id: detail.nfcRoundId,
      name: detail.roundName ?? '순찰점검',
      state,
      stateName: mapStateName(state),
      buildingName: detail.buildingName,
      floorCount: floors.length,
      completedFloors,
      totalCheckpoints: totalZones,
      completedCheckpoints: completedZones,
      scheduledDate: startDate,
      isToday: startDate === today,
      floors,
    };
  }, [detailQuery.data, targetsQuery.data]);

  const isLoading = detailQuery.isLoading || targetsQuery.isLoading;
  const isError = detailQuery.isError || targetsQuery.isError;
  const error = detailQuery.error || targetsQuery.error;

  const refetch = async () => {
    await Promise.all([detailQuery.refetch(), targetsQuery.refetch()]);
  };

  return {
    data: patrolDetail,
    isLoading,
    isError,
    error,
    refetch,
    requestComplete: (nfcRoundIdParam: number) =>
      completeMutation.mutate({ nfcRoundId: nfcRoundIdParam }),
    isCompleting: completeMutation.isPending,
  };
}
