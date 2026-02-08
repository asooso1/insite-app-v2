/**
 * 순찰 필터 바 컴포넌트
 *
 * 순찰 상태별 필터링 버튼 그룹
 */
import React from 'react';
import { XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import type { PatrolFilterOption } from '../types/patrol.types';

interface PatrolFilterBarProps {
  selectedFilter: PatrolFilterOption;
  onFilterChange: (filter: PatrolFilterOption) => void;
}

const FILTER_OPTIONS: Array<{
  value: PatrolFilterOption;
  label: string;
}> = [
  { value: 'ALL', label: '전체' },
  { value: 'ISSUE', label: '미실시' },
  { value: 'PROCESSING', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
];

/**
 * 순찰 필터 바
 */
export function PatrolFilterBar({ selectedFilter, onFilterChange }: PatrolFilterBarProps) {
  return (
    <XStack gap="$2" paddingHorizontal="$4" paddingVertical="$3">
      {FILTER_OPTIONS.map((option) => {
        const isSelected = selectedFilter === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onFilterChange(option.value)}
            style={{ flex: 1 }}
          >
            {({ pressed }) => (
              <XStack
                paddingVertical="$2"
                paddingHorizontal="$3"
                borderRadius="$2"
                backgroundColor={isSelected ? '$primary' : '$gray100'}
                justifyContent="center"
                alignItems="center"
                opacity={pressed ? 0.7 : 1}
                scale={pressed ? 0.98 : 1}
              >
                <Text
                  fontSize={14}
                  fontWeight={isSelected ? '600' : '500'}
                  color={isSelected ? '$white' : '$gray700'}
                >
                  {option.label}
                </Text>
              </XStack>
            )}
          </Pressable>
        );
      })}
    </XStack>
  );
}

export default PatrolFilterBar;
