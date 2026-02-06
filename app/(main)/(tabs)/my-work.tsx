import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [selectedStatus, setSelectedStatus] = useState<WorkStatus>('all');

  const filteredItems =
    selectedStatus === 'all'
      ? mockWorkItems
      : mockWorkItems.filter((item) => item.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#F5F5F5', text: '#6E6E6E' };
      case 'in_progress':
        return { bg: '#FFF4E6', text: '#BEA736' };
      case 'completed':
        return { bg: '#E6F7F1', text: '#12805C' };
      default:
        return { bg: '#F5F5F5', text: '#6E6E6E' };
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
        return '#C9252D';
      case 'medium':
        return '#BEA736';
      case 'low':
        return '#12805C';
      default:
        return '#6E6E6E';
    }
  };

  const renderWorkItem = ({ item }: { item: WorkItem }) => {
    const statusStyle = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.workItem}
        onPress={() => router.push(`/(main)/work/${item.id}`)}
      >
        <View style={styles.workItemHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
        </View>
        <Text style={styles.workTitle}>{item.title}</Text>
        <View style={styles.workMeta}>
          <Text style={styles.workLocation}>{item.location}</Text>
          <Text style={styles.workDueDate}>{item.dueDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>내 작업</Text>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, selectedStatus === filter.key && styles.filterButtonActive]}
            onPress={() => setSelectedStatus(filter.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Work List */}
      <FlatList
        data={filteredItems}
        renderItem={renderWorkItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>배정된 작업이 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#0064FF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6E6E6E',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  workItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  workItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  workMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workLocation: {
    fontSize: 14,
    color: '#6E6E6E',
  },
  workDueDate: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6E6E6E',
  },
});
