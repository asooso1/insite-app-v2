/**
 * 순찰점검 목록 화면
 *
 * 순찰 일정 목록, 오늘의 순찰 강조, 상태별 필터 기능 제공
 */
import React, { useState, useMemo } from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Text, Separator } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PatrolCard } from '@/features/patrol/components/PatrolCard';
import { PatrolFilterBar } from '@/features/patrol/components/PatrolFilterBar';
import { mockPatrols } from '@/features/patrol/data/mockPatrols';
import type { PatrolDTO, PatrolFilterOption } from '@/features/patrol/types/patrol.types';

/**
 * 순찰점검 목록 화면
 */
export default function PatrolListScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<PatrolFilterOption>('ALL');

  // 필터링된 순찰 목록
  const filteredPatrols = useMemo(() => {
    if (selectedFilter === 'ALL') {
      return mockPatrols;
    }
    return mockPatrols.filter((patrol) => patrol.state === selectedFilter);
  }, [selectedFilter]);

  // 오늘의 순찰과 기타 순찰 분리
  const todayPatrols = useMemo(
    () => filteredPatrols.filter((patrol) => patrol.isToday),
    [filteredPatrols]
  );

  const otherPatrols = useMemo(
    () => filteredPatrols.filter((patrol) => !patrol.isToday),
    [filteredPatrols]
  );

  // 순찰 카드 클릭 핸들러
  const handlePatrolPress = (patrol: PatrolDTO) => {
    // 상세 화면으로 이동 (다음 태스크)
    router.push(`/patrol/${patrol.id}`);
  };

  // 섹션별 렌더링을 위한 데이터 구조
  const sections = useMemo(() => {
    const result: Array<{ type: 'header' | 'item'; data?: PatrolDTO; title?: string }> = [];

    // 오늘의 순찰 섹션
    if (todayPatrols.length > 0) {
      result.push({ type: 'header', title: '오늘의 순찰' });
      todayPatrols.forEach((patrol) => {
        result.push({ type: 'item', data: patrol });
      });
    }

    // 기타 순찰 섹션
    if (otherPatrols.length > 0) {
      result.push({ type: 'header', title: '예정 순찰' });
      otherPatrols.forEach((patrol) => {
        result.push({ type: 'item', data: patrol });
      });
    }

    return result;
  }, [todayPatrols, otherPatrols]);

  // 리스트 아이템 렌더링
  const renderItem = ({ item }: { item: (typeof sections)[0] }) => {
    if (item.type === 'header') {
      return (
        <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$2">
          <Text fontSize={18} fontWeight="700" color="$gray900">
            {item.title}
          </Text>
          <Separator marginTop="$2" backgroundColor="$gray200" />
        </YStack>
      );
    }

    if (item.data) {
      return (
        <PatrolCard
          patrol={item.data}
          onPress={handlePatrolPress}
          highlighted={item.data.isToday}
        />
      );
    }

    return null;
  };

  // 빈 상태 렌더링
  const renderEmpty = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$10">
      <Text fontSize={16} color="$gray500">
        {selectedFilter === 'ALL'
          ? '등록된 순찰이 없습니다'
          : '해당 상태의 순찰이 없습니다'}
      </Text>
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <YStack flex={1}>
        {/* 헤더 */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="$gray200"
          backgroundColor="$white"
        >
          <Text fontSize={24} fontWeight="700" color="$gray900">
            순찰점검
          </Text>
        </XStack>

        {/* 필터 바 */}
        <PatrolFilterBar
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* 순찰 목록 */}
        <FlatList
          data={sections}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${index}` : `patrol-${item.data?.id}`
          }
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmpty}
        />
      </YStack>
    </SafeAreaView>
  );
}
