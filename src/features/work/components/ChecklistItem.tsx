/**
 * 체크리스트 항목 컴포넌트
 *
 * 결과 유형에 따라 다른 입력 컴포넌트를 렌더링
 */
import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import type { ChecklistItemData, ChecklistItemResult } from '../types/checklist.types';

interface ChecklistItemProps {
  /** 체크리스트 항목 */
  item: ChecklistItemData;
  /** 현재 결과 값 */
  value?: ChecklistItemResult;
  /** 값 변경 핸들러 */
  onChange: (result: ChecklistItemResult) => void;
}

/**
 * 체크리스트 항목 컴포넌트
 */
export function ChecklistItem({ item, value, onChange }: ChecklistItemProps) {
  const handleTextChange = (text: string) => {
    onChange({
      itemId: item.id,
      value: text,
    });
  };

  const handleGoodNoGoodChange = (isGood: boolean) => {
    onChange({
      itemId: item.id,
      value: isGood ? '양호' : '불량',
      isGood,
    });
  };

  const handleDoDontChange = (isDone: boolean) => {
    onChange({
      itemId: item.id,
      value: isDone ? '실시' : '미실시',
      isDone,
    });
  };

  const handleOnOffChange = (isOn: boolean) => {
    onChange({
      itemId: item.id,
      value: isOn,
    });
  };

  const handleAnalogChange = (text: string) => {
    const numValue = parseFloat(text);
    onChange({
      itemId: item.id,
      value: isNaN(numValue) ? 0 : numValue,
    });
  };

  const renderInput = () => {
    switch (item.resultType) {
      case 'TEXT':
        return (
          <TextField
            placeholder="결과를 입력하세요"
            value={value?.value?.toString() || ''}
            onChangeText={handleTextChange}
            multiline
            numberOfLines={3}
          />
        );

      case 'GOOD_NO_GOOD':
        return (
          <XStack gap="$3">
            <Button
              variant={value?.isGood === true ? 'success' : 'outline'}
              onPress={() => handleGoodNoGoodChange(true)}
              fullWidth
            >
              양호
            </Button>
            <Button
              variant={value?.isGood === false ? 'danger' : 'outline'}
              onPress={() => handleGoodNoGoodChange(false)}
              fullWidth
            >
              불량
            </Button>
          </XStack>
        );

      case 'DO_DONT':
        return (
          <XStack gap="$3">
            <Button
              variant={value?.isDone === true ? 'primary' : 'outline'}
              onPress={() => handleDoDontChange(true)}
              fullWidth
            >
              실시
            </Button>
            <Button
              variant={value?.isDone === false ? 'secondary' : 'outline'}
              onPress={() => handleDoDontChange(false)}
              fullWidth
            >
              미실시
            </Button>
          </XStack>
        );

      case 'ON_OFF':
        return (
          <Switch
            checked={value?.value === true}
            onChange={handleOnOffChange}
            label={value?.value === true ? 'On' : 'Off'}
          />
        );

      case 'ANALOG':
        return (
          <XStack gap="$2" alignItems="center">
            <YStack flex={1}>
              <TextField
                placeholder="값을 입력하세요"
                value={value?.value?.toString() || ''}
                onChangeText={handleAnalogChange}
                keyboardType="numeric"
              />
            </YStack>
            {item.unit && (
              <Text fontSize={16} color="$gray600">
                {item.unit}
              </Text>
            )}
          </XStack>
        );

      default:
        return null;
    }
  };

  return (
    <YStack gap="$2" paddingVertical="$3">
      <XStack alignItems="center" gap="$2">
        <Text fontSize={15} fontWeight="600" color="$gray900" flex={1}>
          {item.name}
        </Text>
        {item.required && (
          <Text fontSize={14} color="$error">
            *
          </Text>
        )}
      </XStack>
      {renderInput()}
    </YStack>
  );
}

export default ChecklistItem;
