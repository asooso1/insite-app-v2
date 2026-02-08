/**
 * 알람 대시보드 화면
 *
 * Sprint 3.3 - 시스템 알람 목록, 심각도별 필터, 상세 모달 표시
 */
import React, { useState, useMemo } from 'react';
import { YStack } from 'tamagui';
import { FlatList, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  AlarmSummaryCard,
  AlarmFilterBar,
  AlarmCard,
  AlarmDetailModal,
} from '@/features/dashboard/components';
import type { AlarmDTO, AlarmSeverity } from '@/features/dashboard/types/alarm.types';
import { mockAlarms, mockAlarmStats } from '@/features/dashboard/data/mockAlarms';

/**
 * 알람 대시보드 화면
 */
export default function AlarmDashboardScreen() {
  // 상태 관리
  const [selectedSeverity, setSelectedSeverity] = useState<AlarmSeverity | null>(null);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmDTO | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alarms, setAlarms] = useState<AlarmDTO[]>(mockAlarms);

  // 필터링된 알람 목록
  const filteredAlarms = useMemo(() => {
    if (selectedSeverity === null) {
      return alarms;
    }
    return alarms.filter((alarm) => alarm.severity === selectedSeverity);
  }, [alarms, selectedSeverity]);

  // 알람 카드 클릭 핸들러
  const handleAlarmPress = (alarm: AlarmDTO) => {
    setSelectedAlarm(alarm);
    setIsModalVisible(true);
  };

  // 알람 확인 핸들러
  const handleAcknowledge = (alarmId: number) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === alarmId ? { ...alarm, isAcknowledged: true } : alarm))
    );
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    setRefreshing(true);
    // Mock 데이터 새로고침 시뮬레이션
    setTimeout(() => {
      setAlarms(mockAlarms);
      setRefreshing(false);
    }, 1000);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedAlarm(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '알람 대시보드',
          headerShown: true,
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['bottom']}>
        <YStack flex={1} backgroundColor="$white">
          {/* 알람 통계 요약 */}
          <AlarmSummaryCard stats={mockAlarmStats} />

          {/* 필터 바 */}
          <AlarmFilterBar
            selectedSeverity={selectedSeverity}
            onFilterChange={setSelectedSeverity}
          />

          {/* 알람 목록 */}
          <FlatList
            data={filteredAlarms}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <AlarmCard alarm={item} onPress={handleAlarmPress} />}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: 20,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <EmptyState
                icon="🔕"
                title="알람이 없습니다"
                description={
                  selectedSeverity
                    ? '해당 심각도의 알람이 없습니다.'
                    : '현재 등록된 알람이 없습니다.'
                }
              />
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        </YStack>
      </SafeAreaView>

      {/* 알람 상세 모달 */}
      <AlarmDetailModal
        visible={isModalVisible}
        alarm={selectedAlarm}
        onClose={handleModalClose}
        onAcknowledge={handleAcknowledge}
      />
    </>
  );
}
