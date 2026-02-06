import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { APP_NAME } from '@/constants/config';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Refetch dashboard data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요,</Text>
            <Text style={styles.userName}>{user?.name ?? '사용자'}님</Text>
          </View>
          <View style={styles.siteBadge}>
            <Text style={styles.siteName}>{user?.siteName ?? '현장'}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>오늘의 작업</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>진행 중</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(main)/work')}
            >
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionText}>작업지시</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(main)/patrol')}
            >
              <Text style={styles.quickActionIcon}>🚶</Text>
              <Text style={styles.quickActionText}>순찰점검</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(main)/dashboard/bems')}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>대시보드</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(main)/(tabs)/scan')}
            >
              <Text style={styles.quickActionIcon}>📱</Text>
              <Text style={styles.quickActionText}>NFC 스캔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Work */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>오늘의 작업</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/work')}>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.workList}>
            {/* Mock work items */}
            {[1, 2, 3].map((i) => (
              <TouchableOpacity key={i} style={styles.workItem}>
                <View style={styles.workItemHeader}>
                  <View style={styles.workStatusBadge}>
                    <Text style={styles.workStatusText}>진행중</Text>
                  </View>
                  <Text style={styles.workItemTime}>09:00</Text>
                </View>
                <Text style={styles.workItemTitle}>설비 점검 #{i}</Text>
                <Text style={styles.workItemLocation}>B1F 기계실</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공지사항</Text>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>시스템 점검 안내</Text>
            <Text style={styles.noticeContent}>
              2024년 1월 20일 새벽 2시~4시 시스템 점검이 예정되어 있습니다.
            </Text>
            <Text style={styles.noticeDate}>2024-01-15</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#6E6E6E',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  siteBadge: {
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  siteName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0064FF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0064FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6E6E6E',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#0064FF',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  workList: {
    gap: 12,
  },
  workItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  workItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workStatusBadge: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  workStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#BEA736',
  },
  workItemTime: {
    fontSize: 12,
    color: '#6E6E6E',
  },
  workItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  workItemLocation: {
    fontSize: 14,
    color: '#6E6E6E',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  noticeContent: {
    fontSize: 14,
    color: '#6E6E6E',
    lineHeight: 20,
    marginBottom: 8,
  },
  noticeDate: {
    fontSize: 12,
    color: '#8E8E8E',
  },
});
