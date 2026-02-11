/**
 * 내 작업 화면
 *
 * 2026 Modern UI - CollapsibleGradientHeader 적용
 */
import React, { useState, useRef } from 'react';
import { Animated, RefreshControl, Pressable } from 'react-native';
import { YStack, XStack, Text, useTheme, View } from 'tamagui';
import { useRouter } from 'expo-router';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { FilterPill } from '@/components/ui/FilterPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

type WorkStatus = 'all' | 'pending' | 'in_progress' | 'completed';

interface WorkItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  location: string;
  dueDate: string;
}

const mockWorkItems: WorkItem[] = [
  {
    id: '1',
    title: '냉방기 필터 청소',
    status: 'in_progress',
    priority: 'high',
    location: '3F 사무실',
    dueDate: '2024-01-15',
  },
  {
    id: '2',
    title: '전등 교체',
    status: 'pending',
    priority: 'medium',
    location: 'B1F 주차장',
    dueDate: '2024-01-16',
  },
  {
    id: '3',
    title: '소방설비 점검',
    status: 'completed',
    priority: 'high',
    location: '전층',
    dueDate: '2024-01-14',
  },
];

const statusFilters: { key: WorkStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기' },
  { key: 'in_progress', label: '진행중' },
  { key: 'completed', label: '완료' },
];

export default function MyWorkScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isSeniorMode } = useSeniorStyles();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  const [selectedStatus, setSelectedStatus] = useState<WorkStatus>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredItems =
    selectedStatus === 'all'
      ? mockWorkItems
      : mockWorkItems.filter((item) => item.status === selectedStatus);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const getStatusColor = (
    status: string
  ): {
    bg: '$gray100' | '$warningMuted' | '$successMuted';
    text: '$gray600' | '$warning' | '$success';
  } => {
    switch (status) {
      case 'pending':
        return { bg: '$gray100', text: '$gray600' };
      case 'in_progress':
        return { bg: '$warningMuted', text: '$warning' };
      case 'completed':
        return { bg: '$successMuted', text: '$success' };
      default:
        return { bg: '$gray100', text: '$gray600' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '$error';
      case 'medium':
        return '$warning';
      case 'low':
        return '$success';
      default:
        return '$gray500';
    }
  };

  const renderHeader = () => (
    <XStack paddingHorizontal="$4" paddingVertical="$3" gap="$2" flexWrap="wrap">
      {statusFilters.map((filter) => (
        <FilterPill
          key={filter.key}
          label={filter.label}
          selected={selectedStatus === filter.key}
          onPress={() => setSelectedStatus(filter.key)}
        />
      ))}
    </XStack>
  );

  const renderItem = ({ item }: { item: WorkItem }) => {
    const statusStyle = getStatusColor(item.status);

    return (
      <Pressable onPress={() => router.push(`/(main)/work/${item.id}`)}>
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          marginBottom="$3"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
            <YStack
              backgroundColor={statusStyle.bg}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius={6}
            >
              <Text fontSize={12} fontWeight="600" color={statusStyle.text}>
                {getStatusLabel(item.status)}
              </Text>
            </YStack>
            <View
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={getPriorityColor(item.priority)}
            />
          </XStack>
          <Text
            fontSize={isSeniorMode ? 18 : 16}
            fontWeight="600"
            color="$gray900"
            marginBottom="$2"
          >
            {item.title}
          </Text>
          <XStack justifyContent="space-between">
            <Text fontSize={14} color="$gray500">
              {item.location}
            </Text>
            <Text fontSize={14} color="$gray400">
              {item.dueDate}
            </Text>
          </XStack>
        </YStack>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$10">
      <EmptyState
        title="배정된 작업이 없습니다"
        description={
          selectedStatus === 'all'
            ? '새 작업이 배정되면 여기에 표시됩니다'
            : '해당 상태의 작업이 없습니다'
        }
      />
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="내 작업"
        expandedHeight={100}
        collapsedHeight={80}
      />

      {/* 작업 목록 */}
      <Animated.FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary.val}
            colors={[theme.primary.val]}
          />
        }
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
