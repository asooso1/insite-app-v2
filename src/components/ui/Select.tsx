/**
 * Select 컴포넌트
 */
import React, { useState } from 'react';
import { Modal, FlatList, Pressable } from 'react-native';
import { styled, XStack, YStack, Text } from 'tamagui';

const SelectTrigger = styled(XStack, {
  name: 'SelectTrigger',
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

const SelectText = styled(Text, {
  name: 'SelectText',
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

const SelectIcon = styled(Text, {
  name: 'SelectIcon',
  fontSize: 12,
  color: '$gray500',
});

const OptionsModal = styled(YStack, {
  name: 'SelectOptionsModal',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '$white',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  maxHeight: '50%',
});

const OptionsHeader = styled(XStack, {
  name: 'SelectOptionsHeader',
  paddingHorizontal: 16,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: '$gray200',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const OptionsTitle = styled(Text, {
  name: 'SelectOptionsTitle',
  fontSize: 18,
  fontWeight: '600',
  color: '$gray900',
});

const OptionItem = styled(XStack, {
  name: 'SelectOptionItem',
  paddingHorizontal: 16,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$gray100',

  variants: {
    selected: {
      true: { backgroundColor: '$primaryLight' },
    },
  } as const,
});

const OptionText = styled(Text, {
  name: 'SelectOptionText',
  fontSize: 16,
  color: '$gray900',

  variants: {
    selected: {
      true: { color: '$primary', fontWeight: '600' },
    },
  } as const,
});

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'senior';
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  title = '선택',
  disabled = false,
  error = false,
  size = 'md',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable onPress={() => !disabled && setIsOpen(true)}>
        <SelectTrigger disabled={disabled} error={error} size={size}>
          <SelectText placeholder={!selectedOption} size={size}>
            {selectedOption?.label || placeholder}
          </SelectText>
          <SelectIcon>▼</SelectIcon>
        </SelectTrigger>
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
          <OptionsModal>
            <OptionsHeader>
              <OptionsTitle>{title}</OptionsTitle>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text fontSize={16} color="$primary">
                  닫기
                </Text>
              </Pressable>
            </OptionsHeader>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSelect(item)} disabled={item.disabled}>
                  <OptionItem selected={item.value === value}>
                    <OptionText selected={item.value === value} opacity={item.disabled ? 0.5 : 1}>
                      {item.label}
                    </OptionText>
                    {item.value === value && <Text color="$primary">✓</Text>}
                  </OptionItem>
                </Pressable>
              )}
            />
          </OptionsModal>
        </Pressable>
      </Modal>
    </>
  );
}

export type { SelectProps, SelectOption };
export default Select;
