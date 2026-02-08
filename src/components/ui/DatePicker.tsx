/**
 * DatePicker 컴포넌트
 *
 * 참고: @react-native-community/datetimepicker는 네이티브 모듈이므로
 * Development Build에서만 동작합니다.
 */
import React, { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { styled, XStack, YStack, Text } from 'tamagui';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from './Button';

const DatePickerTrigger = styled(XStack, {
  name: 'DatePickerTrigger',
  height: 44,
  paddingHorizontal: 16,
  borderWidth: 1,
  borderColor: '$gray300',
  borderRadius: 8,
  backgroundColor: '$white',
  alignItems: 'center',
  justifyContent: 'space-between',

  variants: {
    disabled: {
      true: { backgroundColor: '$gray100', opacity: 0.7 },
    },
    error: {
      true: { borderColor: '$error' },
    },
    size: {
      sm: { height: 36, paddingHorizontal: 12 },
      md: { height: 44, paddingHorizontal: 16 },
      lg: { height: 52, paddingHorizontal: 20 },
      senior: { height: 53, paddingHorizontal: 20 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

const DatePickerText = styled(Text, {
  name: 'DatePickerText',
  fontSize: 16,
  color: '$gray900',

  variants: {
    placeholder: {
      true: { color: '$gray400' },
    },
    size: {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
      senior: { fontSize: 19 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

const DatePickerIcon = styled(Text, {
  name: 'DatePickerIcon',
  fontSize: 16,
  color: '$gray500',
});

const PickerModal = styled(YStack, {
  name: 'DatePickerModal',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '$white',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingBottom: 24,
});

const PickerHeader = styled(XStack, {
  name: 'DatePickerHeader',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '$gray200',
  justifyContent: 'space-between',
  alignItems: 'center',
});

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'senior';
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  dateFormat?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = '날짜를 선택하세요',
  disabled = false,
  error = false,
  size = 'md',
  mode = 'date',
  dateFormat,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    if (dateFormat) {
      return format(date, dateFormat, { locale: ko });
    }
    switch (mode) {
      case 'time':
        return format(date, 'HH:mm', { locale: ko });
      case 'datetime':
        return format(date, 'yyyy-MM-dd HH:mm', { locale: ko });
      default:
        return format(date, 'yyyy-MM-dd', { locale: ko });
    }
  };

  const handleSelectToday = () => {
    onChange?.(new Date());
    setIsOpen(false);
  };

  return (
    <>
      <Pressable onPress={() => !disabled && setIsOpen(true)}>
        <DatePickerTrigger disabled={disabled} error={error} size={size}>
          <DatePickerText placeholder={!value} size={size}>
            {value ? formatDate(value) : placeholder}
          </DatePickerText>
          <DatePickerIcon>📅</DatePickerIcon>
        </DatePickerTrigger>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setIsOpen(false)}
        >
          <YStack flex={1} />
          <PickerModal>
            <PickerHeader>
              <Button variant="ghost" size="sm" onPress={() => setIsOpen(false)}>
                취소
              </Button>
              <Text fontSize={16} fontWeight="600" color="$gray900">
                {mode === 'time' ? '시간 선택' : '날짜 선택'}
              </Text>
              <Button variant="ghost" size="sm" onPress={handleSelectToday}>
                오늘
              </Button>
            </PickerHeader>

            <YStack padding={20} alignItems="center">
              <Text color="$gray500" fontSize={14} marginBottom={16}>
                네이티브 DatePicker는 Development Build에서만 동작합니다.
              </Text>
              <Button variant="primary" onPress={handleSelectToday}>
                오늘 날짜 선택
              </Button>
            </YStack>
          </PickerModal>
        </Pressable>
      </Modal>
    </>
  );
}

export type { DatePickerProps };
export default DatePicker;
