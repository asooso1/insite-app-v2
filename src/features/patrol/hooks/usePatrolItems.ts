/**
 * 순찰 점검 항목 조회 훅
 *
 * @description 특정 구역의 점검 항목 목록을 조회합니다
 */

import { useGetPatrolItems } from '@/api/generated/patrol/patrol';
import type { PatrolItemDTO } from '@/api/generated/models';

interface UsePatrolItemsOptions {
  nfcRoundId: number;
  buildingFloorZoneId: number;
  enabled?: boolean;
}

/**
 * 순찰 점검 항목 조회 훅
 *
 * @param options - nfcRoundId, buildingFloorZoneId, enabled 옵션
 * @returns 점검 항목 목록 및 쿼리 상태
 *
 * @example
 * ```tsx
 * const { items, isLoading } = usePatrolItems({
 *   nfcRoundId: 1001,
 *   buildingFloorZoneId: 101,
 * });
 *
 * items?.forEach(item => {
 *   console.log(item.itemName); // "비상구 점검", "소화기 점검" 등
 *   console.log(item.type); // "SAFETY", "FACILITY" 등
 * });
 * ```
 */
export function usePatrolItems({
  nfcRoundId,
  buildingFloorZoneId,
  enabled = true,
}: UsePatrolItemsOptions) {
  const query = useGetPatrolItems(
    { nfcRoundId, buildingFloorZoneId },
    {
      query: {
        enabled: enabled && !!nfcRoundId && !!buildingFloorZoneId,
        select: (response) => response.data || [],
      },
    }
  );

  return {
    ...query,
    items: query.data as PatrolItemDTO[] | undefined,
  };
}
