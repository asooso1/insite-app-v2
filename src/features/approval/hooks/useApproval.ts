/**
 * 승인/확인 관련 커스텀 훅
 *
 * API 연동 및 상태 관리를 위한 훅
 * - useApprovalList: 승인 목록 조회
 * - useBulkApprove: 일괄 확인/승인
 * - useApprovalCount: 건수 조회
 */
import { useMemo, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetTaskList,
  useBulkConfirmTasks,
  useGetTaskCount,
  getGetTaskCountQueryKey,
} from '@/api/generated/tasks/tasks';
import type {
  GetTaskListParams,
  TaskDTO,
  BulkConfirmTasksRequest,
  GetTaskListType,
} from '@/api/generated/models';
import type { ApprovalItemDTO, ApprovalType, ApprovalStatus } from '../types';

/**
 * TaskDTO를 ApprovalItemDTO로 변환
 */
function mapTaskToApprovalItem(task: TaskDTO): ApprovalItemDTO {
  // 타입 매핑
  const typeMap: Record<string, ApprovalType> = {
    WORK_ORDER: 'WORK',
    PATROL: 'PATROL',
    PERSONAL: 'DAILY',
    EMERGENCY: 'EMERGENCY',
    REGULAR: 'REGULAR',
    ADHOC: 'ADHOC',
  };

  // 상태 매핑
  const statusMap: Record<string, ApprovalStatus> = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    승인완료: 'APPROVED',
    '확인 완료': 'APPROVED',
    승인요청: 'PENDING',
  };

  const type = typeMap[task.type] || 'WORK';
  const status = statusMap[task.state || 'PENDING'] || 'PENDING';

  // 타입명 한글화
  const typeNameMap: Record<ApprovalType, string> = {
    WORK: '작업지시',
    PATROL: '순찰',
    EMERGENCY: '긴급',
    REGULAR: '정기',
    ADHOC: '수시',
    DAILY: '일상',
  };

  return {
    id: task.id,
    type,
    typeName: task.typeName || typeNameMap[type],
    title: task.name,
    writerName: task.managerName,
    buildingName: task.buildingName,
    createdDate: task.writeDate || '',
    completedDate: task.planEndDate,
    status,
    priority: task.isDelayed ? 'HIGH' : 'MEDIUM',
  };
}

/**
 * 승인 목록 조회 훅
 *
 * @param params.type - 조회 유형 (confirm: 승인대상, own: 내업무, delayed: 지연업무)
 * @param params.buildingId - 빌딩 ID (필수)
 * @param params.page - 페이지 번호
 * @param params.size - 페이지 크기
 * @param params.onlyUnconfirmed - 미확인만 조회
 */
export function useApprovalList(params: {
  type?: GetTaskListType;
  buildingId?: number;
  page?: number;
  size?: number;
  onlyUnconfirmed?: boolean;
}) {
  const buildingId = params.buildingId ?? 1; // 기본값 1 (테스트용)

  const queryParams: GetTaskListParams = {
    type: params.type || 'confirm',
    buildingId,
    page: params.page ?? 0,
    size: params.size ?? 20,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useGetTaskList(queryParams, {
    query: {
      staleTime: 1000 * 60 * 5, // 5분 캐시
      gcTime: 1000 * 60 * 30, // 30분 가비지 컬렉션
    },
  });

  // 데이터 변환
  const approvalItems = useMemo(() => {
    if (!data?.data?.content) return [];

    let items = data.data.content.map(mapTaskToApprovalItem);

    // 미확인만 필터
    if (params.onlyUnconfirmed) {
      items = items.filter((item) => item.status === 'PENDING');
    }

    return items;
  }, [data?.data?.content, params.onlyUnconfirmed]);

  const totalCount = data?.data?.totalElements ?? 0;
  const hasMore = (params.page ?? 0) * (params.size ?? 20) < totalCount;

  return {
    items: approvalItems,
    totalCount,
    hasMore,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

/**
 * 오늘 승인대상 + 지연업무 동시 조회 훅
 */
export function useApprovalData(options?: { onlyUnconfirmed?: boolean }) {
  // 오늘 승인대상 조회 (type=confirm)
  const todayQuery = useApprovalList({
    type: 'confirm',
    onlyUnconfirmed: options?.onlyUnconfirmed,
  });

  // 지연업무 조회 (type=delayed)
  const delayedQuery = useApprovalList({
    type: 'delayed',
    onlyUnconfirmed: options?.onlyUnconfirmed,
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([todayQuery.refetch(), delayedQuery.refetch()]);
  }, [todayQuery, delayedQuery]);

  return {
    today: todayQuery,
    delayed: delayedQuery,
    isLoading: todayQuery.isLoading || delayedQuery.isLoading,
    refetchAll,
  };
}

/**
 * 일괄 확인/승인 훅
 */
export function useBulkApprove() {
  const queryClient = useQueryClient();
  const mutation = useBulkConfirmTasks();

  const bulkApprove = useCallback(
    async (items: { id: number; type: ApprovalType }[]) => {
      // ApprovalType을 API TaskConfirmItemType으로 변환
      const typeMap: Record<ApprovalType, 'WORK_ORDER' | 'PATROL' | 'PERSONAL' | 'COMPLAIN'> = {
        WORK: 'WORK_ORDER',
        PATROL: 'PATROL',
        EMERGENCY: 'WORK_ORDER',
        REGULAR: 'WORK_ORDER',
        ADHOC: 'WORK_ORDER',
        DAILY: 'PERSONAL',
      };

      const request: BulkConfirmTasksRequest = {
        tasks: items.map((item) => ({
          id: item.id,
          type: typeMap[item.type],
        })),
      };

      const result = await mutation.mutateAsync({ data: request });

      // 성공 시 목록 및 건수 쿼리 무효화
      if (result.code === 'success') {
        await queryClient.invalidateQueries({
          queryKey: ['/m/api/tasks'],
        });
        await queryClient.invalidateQueries({
          queryKey: getGetTaskCountQueryKey(),
        });
      }

      return result;
    },
    [mutation, queryClient]
  );

  return {
    bulkApprove,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * 승인 건수 조회 훅
 *
 * @param buildingId - 빌딩 ID (필수)
 */
export function useApprovalCount(buildingId: number = 1) {
  const { data, isLoading, isError, refetch } = useGetTaskCount(
    { buildingId },
    {
      query: {
        staleTime: 1000 * 60, // 1분 캐시
        refetchInterval: 1000 * 60 * 5, // 5분마다 갱신
      },
    }
  );

  return {
    confirmCount: data?.data?.confirmCount ?? 0,
    ownCount: data?.data?.ownCount ?? 0,
    delayedCount: data?.data?.delayedCount ?? 0,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * 선택 상태 관리 훅
 */
export function useApprovalSelection(items: ApprovalItemDTO[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 선택 가능한 항목 (미확인만, 순찰 제외)
  const selectableItems = useMemo(() => {
    return items.filter((item) => item.status === 'PENDING' && item.type !== 'PATROL');
  }, [items]);

  // 전체 선택 여부
  const isAllSelected = useMemo(() => {
    if (selectableItems.length === 0) return false;
    return selectableItems.every((item) => selectedIds.has(item.id));
  }, [selectableItems, selectedIds]);

  // 선택된 항목 정보
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  // 개별 토글
  const toggleSelect = useCallback((item: ApprovalItemDTO) => {
    // 완료된 항목이나 순찰은 선택 불가
    if (item.status !== 'PENDING' || item.type === 'PATROL') return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  }, []);

  // 전체 선택/해제
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableItems.map((item) => item.id)));
    }
  }, [isAllSelected, selectableItems]);

  // 초기화
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    selectedItems,
    selectableCount: selectableItems.length,
    selectedCount: selectedIds.size,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
}

export default {
  useApprovalList,
  useApprovalData,
  useBulkApprove,
  useApprovalCount,
  useApprovalSelection,
};
