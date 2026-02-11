/**
 * 알람 필터 바 컴포넌트
 */
import React from 'react';
import { XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import type { AlarmSeverity } from '../types/alarm.types';
import { getAlarmSeverityIcon, getAlarmSeverityColor } from '../constants/alarmColors';

interface AlarmFilterBarProps {
  /** 현재 선택된 필터 (null = 전체) */
  selectedSeverity: AlarmSeverity | null;
  /** 필터 변경 콜백 */
  onFilterChange: (severity: AlarmSeverity | null) => void;
}

/**
 * 알람 심각도 필터 바
 */
export function AlarmFilterBar({ selectedSeverity, onFilterChange }: AlarmFilterBarProps) {
  const filters: { severity: AlarmSeverity | null; label: string; icon: string }[] = [
    { severity: null, label: '전체', icon: '📋' },
    { severity: 'CRITICAL', label: '심각', icon: getAlarmSeverityIcon('CRITICAL') },
    { severity: 'WARNING', label: '경고', icon: getAlarmSeverityIcon('WARNING') },
    { severity: 'INFO', label: '정보', icon: getAlarmSeverityIcon('INFO') },
  ];

  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      gap="$2"
      backgroundColor="$white"
      borderBottomWidth={1}
      borderBottomColor="$gray200"
    >
      {filters.map((filter) => {
        const isSelected = selectedSeverity === filter.severity;
        const selectedColor =
          filter.severity === null ? '$primary' : getAlarmSeverityColor(filter.severity);

        return (
          <Pressable key={filter.label} onPress={() => onFilterChange(filter.severity)}>
            {({ pressed }) => (
              <XStack
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius="$full"
                backgroundColor={
                  isSelected ? (selectedColor as any) : pressed ? '$gray100' : '$gray50'
                }
                alignItems="center"
                gap="$2"
                opacity={pressed ? 0.8 : 1}
              >
                <Text fontSize={14}>{filter.icon}</Text>
                <Text
                  fontSize={14}
                  fontWeight={isSelected ? '600' : '400'}
                  color={isSelected ? '$white' : '$gray700'}
                >
                  {filter.label}
                </Text>
              </XStack>
            )}
          </Pressable>
        );
      })}
    </XStack>
  );
}

export default AlarmFilterBar;
