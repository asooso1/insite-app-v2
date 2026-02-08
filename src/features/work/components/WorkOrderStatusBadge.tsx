/**
 * 작업지시 상태 배지 컴포넌트
 *
 * 작업지시 상태를 시각적으로 표시하는 배지
 */
import { Badge } from '@/components/ui/Badge';
import type { WorkOrderDTOState } from '@/api/generated/models';

interface WorkOrderStatusBadgeProps {
  state: WorkOrderDTOState;
}

/**
 * 상태별 색상 매핑
 */
const STATE_COLORS: Record<
  WorkOrderDTOState,
  { bg: string; text: string; label: string }
> = {
  WRITE: {
    bg: '$gray5',
    text: '$gray11',
    label: '작성중',
  },
  ISSUE: {
    bg: '$blue5',
    text: '$blue11',
    label: '발행',
  },
  PROCESSING: {
    bg: '$orange5',
    text: '$orange11',
    label: '진행중',
  },
  REQ_COMPLETE: {
    bg: '$purple5',
    text: '$purple11',
    label: '완료요청',
  },
  COMPLETE: {
    bg: '$green5',
    text: '$green11',
    label: '완료',
  },
  CANCEL: {
    bg: '$red5',
    text: '$red11',
    label: '취소',
  },
};

/**
 * 작업지시 상태 배지
 *
 * @example
 * ```tsx
 * <WorkOrderStatusBadge state="ISSUE" />
 * ```
 */
export function WorkOrderStatusBadge({ state }: WorkOrderStatusBadgeProps) {
  const config = STATE_COLORS[state];

  return (
    <Badge
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
      borderWidth={0}
      paddingHorizontal="$3"
      paddingVertical={6}
      fontSize={12}
    >
      {config.label}
    </Badge>
  );
}
