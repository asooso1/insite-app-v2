/**
 * 설비 카테고리 필터 컴포넌트
 *
 * 3단계 카테고리 선택 모달 (대분류 > 중분류 > 소분류)
 * v1 앱의 EquipmentManagementPage 카테고리 모달 기능 재현
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Modal as RNModal } from 'react-native';
import { YStack, XStack, Text, styled } from 'tamagui';
import { Button } from '@/components/ui/Button';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import type { FacilityCategory, SelectedCategories } from '../types';

// Styled 컴포넌트
const ModalOverlay = styled(YStack, {
  name: 'CategoryModalOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
});

const ModalContent = styled(YStack, {
  name: 'CategoryModalContent',
  backgroundColor: '$white',
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
  overflow: 'hidden',
  maxHeight: '70%',
});

const ModalHeader = styled(XStack, {
  name: 'CategoryModalHeader',
  paddingTop: 24,
  paddingBottom: 16,
  paddingHorizontal: 20,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
});

const SelectedDisplay = styled(YStack, {
  name: 'SelectedDisplay',
  backgroundColor: '$gray100',
  paddingVertical: 12,
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '$gray200',
});

const CategoryHeader = styled(XStack, {
  name: 'CategoryHeader',
  backgroundColor: '$gray100',
  paddingVertical: 12,
  justifyContent: 'space-around',
  borderBottomWidth: 1,
  borderBottomColor: '$gray200',
});

const CategoryColumns = styled(XStack, {
  name: 'CategoryColumns',
  flex: 1,
});

const CategoryColumn = styled(YStack, {
  name: 'CategoryColumn',
  flex: 1,
  borderRightWidth: 1,
  borderRightColor: '$gray200',
});

const CategoryColumnLast = styled(YStack, {
  name: 'CategoryColumnLast',
  flex: 1,
});

// CategoryItem is rendered inline with Pressable

interface CategoryFilterProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 모달 닫기 */
  onClose: () => void;
  /** 선택 완료 시 콜백 */
  onConfirm: (selected: SelectedCategories, categoryText: string) => void;
  /** 1차 분류 목록 */
  firstCategories: FacilityCategory[];
  /** 2차 분류 목록 */
  secondCategories: FacilityCategory[];
  /** 3차 분류 목록 */
  thirdCategories: FacilityCategory[];
  /** 1차 분류 선택 시 콜백 */
  onFirstCategoryChange: (categoryId: number) => void;
  /** 2차 분류 선택 시 콜백 */
  onSecondCategoryChange: (categoryId: number) => void;
  /** 초기 선택 상태 */
  initialSelection?: SelectedCategories;
  /** 로딩 상태 */
  loading?: boolean;
}

/**
 * 3단계 카테고리 필터 모달
 */
export function CategoryFilter({
  visible,
  onClose,
  onConfirm,
  firstCategories,
  secondCategories,
  thirdCategories,
  onFirstCategoryChange,
  onSecondCategoryChange,
  initialSelection,
  loading = false,
}: CategoryFilterProps) {
  const { isSeniorMode, fontSize, colors } = useSeniorStyles();

  // 선택 상태
  const [currentFirst, setCurrentFirst] = useState(initialSelection?.firstCategoryId ?? 0);
  const [currentSecond, setCurrentSecond] = useState(initialSelection?.secondCategoryId ?? 0);
  const [currentThird, setCurrentThird] = useState(initialSelection?.thirdCategoryId ?? 0);

  // 스크롤 참조
  const scrollRefA = useRef<ScrollView>(null);
  const scrollRefB = useRef<ScrollView>(null);
  const scrollRefC = useRef<ScrollView>(null);

  // 선택된 카테고리 텍스트 계산
  const getCategoryText = useCallback(() => {
    const parts: string[] = [];
    if (currentFirst) {
      const first = firstCategories.find((x) => x.value === currentFirst);
      if (first) parts.push(first.name);
    }
    if (currentSecond) {
      const second = secondCategories.find((x) => x.value === currentSecond);
      if (second) parts.push(second.name);
    }
    if (currentThird) {
      const third = thirdCategories.find((x) => x.value === currentThird);
      if (third) parts.push(third.name);
    }
    return parts.join(' - ');
  }, [currentFirst, currentSecond, currentThird, firstCategories, secondCategories, thirdCategories]);

  // 초기 선택 동기화
  useEffect(() => {
    if (visible) {
      setCurrentFirst(initialSelection?.firstCategoryId ?? 0);
      setCurrentSecond(initialSelection?.secondCategoryId ?? 0);
      setCurrentThird(initialSelection?.thirdCategoryId ?? 0);
    }
  }, [visible, initialSelection]);

  // 1차 분류 선택
  const handleFirstSelect = useCallback(
    (categoryId: number) => {
      if (currentFirst === categoryId) {
        // 같은 항목 다시 클릭하면 해제
        setCurrentFirst(0);
        setCurrentSecond(0);
        setCurrentThird(0);
        onFirstCategoryChange(0);
      } else {
        setCurrentFirst(categoryId);
        setCurrentSecond(0);
        setCurrentThird(0);
        onFirstCategoryChange(categoryId);
      }
    },
    [currentFirst, onFirstCategoryChange]
  );

  // 2차 분류 선택
  const handleSecondSelect = useCallback(
    (categoryId: number) => {
      if (currentSecond === categoryId) {
        setCurrentSecond(0);
        setCurrentThird(0);
        onSecondCategoryChange(0);
      } else {
        setCurrentSecond(categoryId);
        setCurrentThird(0);
        onSecondCategoryChange(categoryId);
      }
    },
    [currentSecond, onSecondCategoryChange]
  );

  // 3차 분류 선택
  const handleThirdSelect = useCallback(
    (categoryId: number) => {
      if (currentThird === categoryId) {
        setCurrentThird(0);
      } else {
        setCurrentThird(categoryId);
      }
    },
    [currentThird]
  );

  // 완료 버튼
  const handleConfirm = useCallback(() => {
    const selected: SelectedCategories = {
      firstCategoryId: currentFirst,
      secondCategoryId: currentSecond,
      thirdCategoryId: currentThird,
    };
    const text = getCategoryText();
    onConfirm(selected, text);
    onClose();
  }, [currentFirst, currentSecond, currentThird, getCategoryText, onConfirm, onClose]);

  // 모달 열릴 때 스크롤 위치 조정
  useEffect(() => {
    if (visible) {
      const offset = Platform.OS === 'ios' ? 101 : 109;
      const itemHeight = isSeniorMode ? 56 : 44;

      if (currentFirst !== 0) {
        const index = firstCategories.findIndex((x) => x.value === currentFirst);
        if (index >= 0) {
          setTimeout(() => {
            scrollRefA.current?.scrollTo({
              y: Math.max(0, itemHeight * index - offset),
              animated: false,
            });
          }, 100);
        }
      }
      if (currentSecond !== 0) {
        const index = secondCategories.findIndex((x) => x.value === currentSecond);
        if (index >= 0) {
          setTimeout(() => {
            scrollRefB.current?.scrollTo({
              y: Math.max(0, itemHeight * index - offset),
              animated: false,
            });
          }, 100);
        }
      }
      if (currentThird !== 0) {
        const index = thirdCategories.findIndex((x) => x.value === currentThird);
        if (index >= 0) {
          setTimeout(() => {
            scrollRefC.current?.scrollTo({
              y: Math.max(0, itemHeight * index - offset),
              animated: false,
            });
          }, 100);
        }
      }
    }
  }, [visible, currentFirst, currentSecond, currentThird, firstCategories, secondCategories, thirdCategories, isSeniorMode]);

  const categoryText = getCategoryText();
  const itemHeight = isSeniorMode ? 56 : 44;

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ModalOverlay>
        <ModalContent>
          {/* 헤더 */}
          <ModalHeader>
            <Text fontSize={isSeniorMode ? fontSize.large : 18} fontWeight="700" color="$gray900">
              대/중/소분류 선택하기
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                position: 'absolute',
                right: 20,
                padding: 8,
              }}
            >
              <Text fontSize={20} color="$gray500">
                X
              </Text>
            </Pressable>
          </ModalHeader>

          {/* 선택된 카테고리 표시 */}
          <SelectedDisplay>
            <Text
              fontSize={isSeniorMode ? fontSize.medium : 16}
              fontWeight="600"
              color={categoryText ? '$primary' : '$gray400'}
            >
              {categoryText || '분류를 선택하세요'}
            </Text>
          </SelectedDisplay>

          {/* 카테고리 헤더 */}
          <CategoryHeader>
            <Text
              fontSize={isSeniorMode ? fontSize.small : 14}
              fontWeight="600"
              color="$gray900"
              flex={1}
              textAlign="center"
            >
              대분류
            </Text>
            <Text
              fontSize={isSeniorMode ? fontSize.small : 14}
              fontWeight="600"
              color="$gray900"
              flex={1}
              textAlign="center"
            >
              중분류
            </Text>
            <Text
              fontSize={isSeniorMode ? fontSize.small : 14}
              fontWeight="600"
              color="$gray900"
              flex={1}
              textAlign="center"
            >
              소분류
            </Text>
          </CategoryHeader>

          {/* 카테고리 목록 */}
          {loading ? (
            <YStack flex={1} justifyContent="center" alignItems="center" padding="$8">
              <ActivityIndicator size="large" color={colors.primary} />
            </YStack>
          ) : (
            <CategoryColumns style={{ height: 300 }}>
              {/* 1차 분류 */}
              <CategoryColumn>
                <ScrollView ref={scrollRefA} showsVerticalScrollIndicator={false}>
                  {firstCategories.map((category) => (
                    <Pressable
                      key={category.value}
                      onPress={() => handleFirstSelect(category.value)}
                      style={{
                        backgroundColor: currentFirst === category.value ? '#E8F3FF' : '#FFFFFF',
                        paddingVertical: isSeniorMode ? 16 : 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomWidth: 0.5,
                        borderBottomColor: '#F0F0F2',
                        minHeight: itemHeight,
                      }}
                    >
                      <Text
                        fontSize={isSeniorMode ? fontSize.small : 14}
                        fontWeight={currentFirst === category.value ? '600' : '400'}
                        color={currentFirst === category.value ? '$primary' : '$gray900'}
                        textAlign="center"
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </CategoryColumn>

              {/* 2차 분류 */}
              <CategoryColumn>
                <ScrollView ref={scrollRefB} showsVerticalScrollIndicator={false}>
                  {secondCategories.map((category) => (
                    <Pressable
                      key={category.value}
                      onPress={() => handleSecondSelect(category.value)}
                      style={{
                        backgroundColor: currentSecond === category.value ? '#E8F3FF' : '#FFFFFF',
                        paddingVertical: isSeniorMode ? 16 : 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomWidth: 0.5,
                        borderBottomColor: '#F0F0F2',
                        minHeight: itemHeight,
                      }}
                    >
                      <Text
                        fontSize={isSeniorMode ? fontSize.small : 14}
                        fontWeight={currentSecond === category.value ? '600' : '400'}
                        color={currentSecond === category.value ? '$primary' : '$gray900'}
                        textAlign="center"
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </CategoryColumn>

              {/* 3차 분류 */}
              <CategoryColumnLast>
                <ScrollView ref={scrollRefC} showsVerticalScrollIndicator={false}>
                  {thirdCategories.map((category) => (
                    <Pressable
                      key={category.value}
                      onPress={() => handleThirdSelect(category.value)}
                      style={{
                        backgroundColor: currentThird === category.value ? '#E8F3FF' : '#FFFFFF',
                        paddingVertical: isSeniorMode ? 16 : 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomWidth: 0.5,
                        borderBottomColor: '#F0F0F2',
                        minHeight: itemHeight,
                      }}
                    >
                      <Text
                        fontSize={isSeniorMode ? fontSize.small : 14}
                        fontWeight={currentThird === category.value ? '600' : '400'}
                        color={currentThird === category.value ? '$primary' : '$gray900'}
                        textAlign="center"
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </CategoryColumnLast>
            </CategoryColumns>
          )}

          {/* 완료 버튼 */}
          <YStack padding="$4" paddingBottom={Platform.OS === 'ios' ? 34 : 16}>
            <Button variant="primary" size={isSeniorMode ? 'senior' : 'lg'} fullWidth onPress={handleConfirm}>
              완료
            </Button>
          </YStack>
        </ModalContent>
      </ModalOverlay>
    </RNModal>
  );
}

/**
 * 카테고리 선택 버튼 컴포넌트
 */
interface CategorySelectorButtonProps {
  /** 선택된 카테고리 텍스트 */
  categoryText: string;
  /** 클릭 핸들러 */
  onPress: () => void;
}

export function CategorySelectorButton({ categoryText, onPress }: CategorySelectorButtonProps) {
  const { isSeniorMode, fontSize, colors } = useSeniorStyles();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: isSeniorMode ? colors.cardBackground : '#F7F7FA',
        borderRadius: 8,
        paddingVertical: isSeniorMode ? 16 : 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: isSeniorMode ? 2 : 1,
        borderColor: isSeniorMode ? colors.borderStrong : '#E6E6E8',
      }}
    >
      <Text
        fontSize={isSeniorMode ? fontSize.medium : 16}
        fontWeight="500"
        color={categoryText ? '$primary' : '$gray700'}
        textAlign="center"
      >
        {categoryText || '대/중/소분류 선택하기'}
      </Text>
    </Pressable>
  );
}

export default CategoryFilter;
