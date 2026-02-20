/**
 * 승인/확인 일괄처리 API 연동 훅
 *
 * useAuthStore에서 buildingId를 가져와 API 훅과 연동
 * - useGetTaskList({ type: 'confirm', buildingId }) - 승인대기 목록 조회
 * - useBulkConfirmTasks - 일괄 승인 처리
 * - 성공 시 task 목록 및 task count 쿼리 무효화
 */
import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import {
  useGetTaskList,
  useBulkConfirmTasks,
  useGetTaskCount,
  getGetTaskListQueryKey,
  getGetTaskCountQueryKey,
} from '@/api/generated/tasks/tasks';
import type { BulkConfirmTasksRequest, TaskConfirmItem } from '@/api/generated/models';

/**
 * 승인대기 목록 + 건수 + 일괄 승인 처리를 통합한 훅
 *
 * buildingId는 useAuthStore에서 자동으로 가져옴
 */
export function useApprovalTasks(options?: { page?: number; size?: number }) {
  const user = useAuthStore((s) => s.user);

  // buildingId: string → Number() 변환
  const buildingId = useMemo(() => {
    const bid =
      user?.selectedBuildingAccountDTO?.buildingId ??
      user?.buildingAccountDTO?.[0]?.buildingId;
    return bid ? Number(bid) : 0;
  }, [user]);

  const enabled = buildingId > 0;
  const page = options?.page ?? 0;
  const size = options?.size ?? 100;

  const queryClient = useQueryClient();

  // 승인대기 목록 조회
  const taskListQuery = useGetTaskList(
    { type: 'confirm', buildingId, page, size },
    { query: { enabled } }
  );

  // 업무 건수 조회 (승인대기/내업무/지연)
  const taskCountQuery = useGetTaskCount(
    { buildingId },
    { query: { enabled } }
  );

  // 일괄 승인 처리
  const bulkConfirmMutation = useBulkConfirmTasks({
    mutation: {
      onSuccess: async () => {
        // 목록 쿼리 무효화
        await queryClient.invalidateQueries({
          queryKey: getGetTaskListQueryKey({ type: 'confirm', buildingId, page, size }),
        });
        // 건수 쿼리 무효화
        await queryClient.invalidateQueries({
          queryKey: getGetTaskCountQueryKey({ buildingId }),
        });
      },
    },
  });

  /**
   * 선택된 항목들을 일괄 승인 처리
   */
  const bulkConfirm = useCallback(
    (tasks: TaskConfirmItem[], confirmNote?: string) => {
      const request: BulkConfirmTasksRequest = {
        tasks,
        ...(confirmNote ? { confirmNote } : {}),
      };
      return bulkConfirmMutation.mutateAsync({ data: request });
    },
    [bulkConfirmMutation]
  );

  // 파생 데이터
  const approvalItems = taskListQuery.data?.data?.content ?? [];
  const totalElements = taskListQuery.data?.data?.totalElements ?? 0;
  const confirmCount = taskCountQuery.data?.data?.confirmCount ?? 0;
  const ownCount = taskCountQuery.data?.data?.ownCount ?? 0;
  const delayedCount = taskCountQuery.data?.data?.delayedCount ?? 0;

  return {
    // 승인대기 목록
    approvalItems,
    totalElements,
    isLoading: taskListQuery.isLoading,
    isFetching: taskListQuery.isFetching,
    isError: taskListQuery.isError,
    refetch: taskListQuery.refetch,

    // 건수
    confirmCount,
    ownCount,
    delayedCount,
    isCountLoading: taskCountQuery.isLoading,

    // 일괄 승인
    bulkConfirm,
    isConfirming: bulkConfirmMutation.isPending,
    isConfirmError: bulkConfirmMutation.isError,
    confirmError: bulkConfirmMutation.error,
    isConfirmSuccess: bulkConfirmMutation.isSuccess,
    resetConfirm: bulkConfirmMutation.reset,

    // 빌딩 ID
    buildingId,
  };
}
