/**
 * 순찰 대상 조회 훅
 *
 * @description 순찰점검의 층별 구역 목록을 조회합니다
 */

import { useGetPatrolTargets } from '@/api/generated/patrol/patrol';
import type { PatrolFloorDTO } from '@/api/generated/models';

interface UsePatrolTargetsOptions {
  nfcRoundId: number;
  enabled?: boolean;
}

/**
 * 순찰 대상(층별 구역) 조회 훅
 *
 * @param options - nfcRoundId와 enabled 옵션
 * @returns 층별 구역 목록 및 쿼리 상태
 *
 * @example
 * ```tsx
 * const { data, isLoading } = usePatrolTargets({ nfcRoundId: 1001 });
 *
 * // data는 PatrolFloorDTO[] 배열
 * data?.forEach(floor => {
 *   console.log(floor.buildingFloorName); // "1층", "2층" 등
 *   floor.nfcRoundTargetDTOS.forEach(zone => {
 *     console.log(zone.buildingFloorZoneName); // "로비", "복도" 등
 *     console.log(zone.isCompleted); // true/false
 *   });
 * });
 * ```
 */
export function usePatrolTargets({ nfcRoundId, enabled = true }: UsePatrolTargetsOptions) {
  const query = useGetPatrolTargets(
    { nfcRoundId },
    {
      query: {
        enabled: enabled && !!nfcRoundId,
        select: (response) => response.data || [],
      },
    }
  );

  return {
    ...query,
    floors: query.data as PatrolFloorDTO[] | undefined,
  };
}

/**
 * 순찰 진행률 계산 유틸리티
 *
 * @param floors - 층별 구역 목록
 * @returns 전체 구역 수, 완료된 구역 수, 진행률(%)
 */
export function calculatePatrolProgress(floors?: PatrolFloorDTO[]) {
  if (!floors || floors.length === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  let total = 0;
  let completed = 0;

  floors.forEach((floor) => {
    floor.nfcRoundTargetDTOS.forEach((zone) => {
      total++;
      if (zone.isCompleted) {
        completed++;
      }
    });
  });

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}
