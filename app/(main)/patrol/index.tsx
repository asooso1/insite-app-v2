/**
 * 순찰점검 목록 화면
 *
 * 2026 Modern UI - Glassmorphism, 그라디언트 헤더, 플로팅 카드
 * 순찰 일정 목록, 오늘의 순찰 강조, 상태별 필터 기능 제공
 * Lucide Icons 사용
 * 시니어 모드 지원: 확대된 리스트 아이템, 고대비 배지, 테두리 강조
 */
import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { GlassFilterBar, PatrolCardEnhanced } from '@/features/patrol/components';
import { mockPatrols } from '@/features/patrol/data/mockPatrols';
import type { PatrolDTO, PatrolFilterOption } from '@/features/patrol/types/patrol.types';
import { LAYOUT } from '@/theme/tokens';
import { AppIcon, type IconName } from '@/components/icons';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCardListItem, SeniorStatusBadge } from '@/components/ui/SeniorCard';

/**
 * 순찰점검 목록 화면
 */
export default function PatrolListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<PatrolFilterOption>('ALL');
  const { isSeniorMode, fontSize } = useSeniorStyles();

  // 필터 옵션 (카운트 포함)
  const filterOptions = useMemo(() => {
    const counts = {
      ALL: mockPatrols.length,
      ISSUE: mockPatrols.filter((p) => p.state === 'ISSUE').length,
      PROCESSING: mockPatrols.filter((p) => p.state === 'PROCESSING').length,
      COMPLETED: mockPatrols.filter((p) => p.state === 'COMPLETED').length,
    };
    return [
      { value: 'ALL' as PatrolFilterOption, label: '전체', count: counts.ALL },
      { value: 'ISSUE' as PatrolFilterOption, label: '미실시', count: counts.ISSUE },
      { value: 'PROCESSING' as PatrolFilterOption, label: '진행중', count: counts.PROCESSING },
      { value: 'COMPLETED' as PatrolFilterOption, label: '완료', count: counts.COMPLETED },
    ];
  }, []);

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
    router.push(`/patrol/${patrol.id}`);
  };

  // 상태 매핑 헬퍼
  const getPatrolStatusBadgeProps = (state: string | undefined) => {
    switch (state) {
      case 'COMPLETED':
        return { status: 'completed' as const, label: '완료' };
      case 'PROCESSING':
        return { status: 'inProgress' as const, label: '진행중' };
      case 'ISSUE':
      default:
        return { status: 'pending' as const, label: '미실시' };
    }
  };

  // 섹션별 렌더링을 위한 데이터 구조
  const sections = useMemo(() => {
    const result: {
      type: 'header' | 'item';
      data?: PatrolDTO;
      title?: string;
      icon?: IconName;
    }[] = [];

    // 오늘의 순찰 섹션
    if (todayPatrols.length > 0) {
      result.push({ type: 'header', title: '오늘의 순찰', icon: 'fire' });
      todayPatrols.forEach((patrol) => {
        result.push({ type: 'item', data: patrol });
      });
    }

    // 기타 순찰 섹션
    if (otherPatrols.length > 0) {
      result.push({ type: 'header', title: '예정 순찰', icon: 'calendar' });
      otherPatrols.forEach((patrol) => {
        result.push({ type: 'item', data: patrol });
      });
    }

    return result;
  }, [todayPatrols, otherPatrols]);

  // 리스트 아이템 렌더링
  const renderItem = ({ item }: { item: (typeof sections)[0]; index: number }) => {
    if (item.type === 'header') {
      return (
        <View>
          <XStack
            paddingHorizontal="$5"
            paddingTop="$5"
            paddingBottom="$2"
            gap="$2"
            alignItems="center"
          >
            {item.icon && <AppIcon name={item.icon} size="sm" color="$accent" />}
            <Text
              fontSize={isSeniorMode ? fontSize.large : 18}
              fontWeight="700"
              color="$gray800"
              letterSpacing={-0.3}
            >
              {item.title}
            </Text>
          </XStack>
        </View>
      );
    }

    if (item.data) {
      if (isSeniorMode) {
        // 시니어 모드: 리스트 아이템 형태
        const statusProps = getPatrolStatusBadgeProps(item.data.state);
        return (
          <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            <SeniorCardListItem
              title={item.data.name || '제목 없음'}
              subtitle={`${item.data.buildingName || ''} · ${item.data.scheduledDate || ''}`}
              right={<SeniorStatusBadge {...statusProps} />}
              onPress={() => handlePatrolPress(item.data!)}
            />
          </View>
        );
      }

      // 일반 모드: 기존 카드
      return (
        <View>
          <PatrolCardEnhanced
            patrol={item.data}
            onPress={handlePatrolPress}
            highlighted={item.data.isToday}
          />
        </View>
      );
    }

    return null;
  };

  // 빈 상태 렌더링
  const renderEmpty = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$10">
      <YStack
        width={80}
        height={80}
        borderRadius="$full"
        backgroundColor="$gray100"
        alignItems="center"
        justifyContent="center"
        marginBottom="$4"
      >
        <AppIcon name="work" size="xl" color="$gray400" />
      </YStack>
      <Text fontSize={16} fontWeight="600" color="$gray700" marginBottom="$2">
        순찰 일정이 없습니다
      </Text>
      <Text fontSize={14} color="$gray500" textAlign="center">
        {selectedFilter === 'ALL' ? '등록된 순찰이 없습니다' : '해당 상태의 순찰이 없습니다'}
      </Text>
    </YStack>
  );

  // 오늘의 순찰 카운트
  const todayCount = mockPatrols.filter((p) => p.isToday).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 그라디언트 헤더 */}
      <View>
        <LinearGradient
          colors={['#0066CC', '#00A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* 배경 장식 */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          <YStack paddingHorizontal="$5" paddingVertical="$4" gap="$1" zIndex={1}>
            <Text fontSize={28} fontWeight="800" color="white" letterSpacing={-0.5}>
              순찰점검
            </Text>
            <Text fontSize={15} color="$glassWhite85">
              오늘 {todayCount}건의 순찰이 있습니다
            </Text>
          </YStack>
        </LinearGradient>
      </View>

      {/* 필터 바 */}
      <GlassFilterBar
        options={filterOptions}
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
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    width: LAYOUT.DECOR_CIRCLE_LARGE,
    height: LAYOUT.DECOR_CIRCLE_LARGE,
    borderRadius: LAYOUT.DECOR_CIRCLE_LARGE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -80,
    right: -40,
  },
  headerDecor2: {
    position: 'absolute',
    width: LAYOUT.DECOR_CIRCLE_MEDIUM,
    height: LAYOUT.DECOR_CIRCLE_MEDIUM,
    borderRadius: LAYOUT.DECOR_CIRCLE_MEDIUM / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -30,
    left: -20,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
});
