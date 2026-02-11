/**
 * 체크리스트 섹션 컴포넌트
 *
 * 체크리스트 항목 목록을 렌더링하고 상태 관리
 */
import React from 'react';
import { YStack, Text } from 'tamagui';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ChecklistItem } from './ChecklistItem';
import type { ChecklistItemData, ChecklistItemResult } from '../types/checklist.types';

interface ChecklistSectionProps {
  /** 체크리스트 항목 목록 */
  items: ChecklistItemData[];
  /** 현재 결과 목록 */
  results: ChecklistItemResult[];
  /** 결과 변경 핸들러 */
  onResultChange: (result: ChecklistItemResult) => void;
}

/**
 * 체크리스트 섹션 컴포넌트
 */
export function ChecklistSection({ items, results, onResultChange }: ChecklistSectionProps) {
  // 특정 항목의 결과 값 찾기
  const getItemResult = (itemId: number): ChecklistItemResult | undefined => {
    return results.find((r) => r.itemId === itemId);
  };

  // 완료된 항목 수 계산
  const completedCount = results.filter((r) => {
    // 값이 존재하고 비어있지 않은 경우를 완료로 간주
    if (r.value === undefined || r.value === null || r.value === '') {
      return false;
    }
    return true;
  }).length;

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <YStack gap="$3">
        {/* 섹션 헤더 */}
        <YStack gap="$2">
          <Text fontSize={18} fontWeight="700" color="$gray900">
            점검 체크리스트
          </Text>
          <Text fontSize={14} color="$gray600">
            {completedCount} / {items.length} 완료
          </Text>
        </YStack>

        <Divider />

        {/* 체크리스트 항목 목록 */}
        <YStack>
          {items.map((item, index) => (
            <YStack key={item.id}>
              <ChecklistItem item={item} value={getItemResult(item.id)} onChange={onResultChange} />
              {index < items.length - 1 && <Divider marginVertical="$2" />}
            </YStack>
          ))}
        </YStack>
      </YStack>
    </Card>
  );
}

export default ChecklistSection;
