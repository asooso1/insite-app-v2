/**
 * 작업지시 상세 정보 컴포넌트
 *
 * 작업지시의 상세 정보를 섹션별로 표시
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Card } from '@/components/ui/Card';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';
import type { WorkOrderDetailDTO } from '@/api/generated/models';

interface WorkOrderDetailProps {
  workOrder: WorkOrderDetailDTO;
}

/**
 * 정보 행 컴포넌트
 */
interface InfoRowProps {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  if (!value) return null;

  return (
    <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
      <Text fontSize={14} color="$gray600" flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize={14}
        color={highlight ? '$primary' : '$gray900'}
        fontWeight={highlight ? '600' : '400'}
        flex={1}
        textAlign="right"
      >
        {value}
      </Text>
    </XStack>
  );
}

/**
 * 섹션 헤더 컴포넌트
 */
interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text fontSize={16} fontWeight="700" color="$gray900" marginBottom="$3">
      {title}
    </Text>
  );
}

/**
 * 작업지시 상세 정보 컴포넌트
 *
 * @example
 * ```tsx
 * <WorkOrderDetail workOrder={workOrderData} />
 * ```
 */
export function WorkOrderDetail({ workOrder }: WorkOrderDetailProps) {
  return (
    <YStack gap="$4">
      {/* 기본 정보 섹션 */}
      <Card>
        <YStack gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={20} fontWeight="700" color="$gray900" flex={1}>
              {workOrder.name}
            </Text>
            <WorkOrderStatusBadge state={workOrder.state} />
          </XStack>

          {workOrder.description && (
            <Text fontSize={14} color="$gray700" lineHeight={20}>
              {workOrder.description}
            </Text>
          )}

          <YStack gap="$2" marginTop="$2">
            <InfoRow
              label="작업 분류"
              value={
                workOrder.firstClassName && workOrder.secondClassName
                  ? `${workOrder.firstClassName} > ${workOrder.secondClassName}`
                  : workOrder.firstClassName || workOrder.secondClassName
              }
            />
            <InfoRow label="빌딩" value={workOrder.buildingName} />
            <InfoRow label="작업 위치" value={workOrder.location} />
            <InfoRow
              label="점검 항목 수"
              value={workOrder.itemSize ? `${workOrder.itemSize}개` : undefined}
              highlight
            />
          </YStack>
        </YStack>
      </Card>

      {/* 일정 정보 섹션 */}
      <Card>
        <YStack gap="$3">
          <SectionHeader title="일정 정보" />
          <YStack gap="$2">
            <InfoRow
              label="계획 시작일"
              value={workOrder.planStartDate}
              highlight
            />
            <InfoRow
              label="계획 종료일"
              value={workOrder.planEndDate}
              highlight
            />
            <InfoRow label="작성일" value={workOrder.writeDate} />
          </YStack>
        </YStack>
      </Card>

      {/* 담당 정보 섹션 */}
      <Card>
        <YStack gap="$3">
          <SectionHeader title="담당 정보" />
          <YStack gap="$2">
            <InfoRow label="작성자" value={workOrder.writerName} />
            <InfoRow label="담당자" value={workOrder.managerName} />
            <InfoRow label="담당자 연락처" value={workOrder.managerPhone} />
          </YStack>
        </YStack>
      </Card>
    </YStack>
  );
}

export default WorkOrderDetail;
