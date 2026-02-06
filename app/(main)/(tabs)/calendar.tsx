import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ScheduleItem {
  id: string;
  title: string;
  type: 'work' | 'patrol';
  time: string;
}

const mockSchedules: Record<string, ScheduleItem[]> = {
  '2024-01-15': [
    { id: '1', title: '냉방기 필터 청소', type: 'work', time: '09:00' },
    { id: '2', title: '오전 순찰', type: 'patrol', time: '10:00' },
  ],
  '2024-01-16': [
    { id: '3', title: '전등 교체', type: 'work', time: '14:00' },
  ],
};

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedSchedules = mockSchedules[selectedDateKey] || [];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = monthStart.getDay();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>캘린더</Text>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Week Days Header */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={[
                styles.weekDayText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Days Grid */}
        <View style={styles.daysGrid}>
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.dayCell} />
          ))}

          {/* Actual days */}
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasSchedule = mockSchedules[dateKey];
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);

            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isDayToday && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isDayToday && !isSelected && styles.dayTextToday,
                  day.getDay() === 0 && styles.sundayText,
                  day.getDay() === 6 && styles.saturdayText,
                ]}>
                  {format(day, 'd')}
                </Text>
                {hasSchedule && <View style={styles.scheduleIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Date Schedules */}
      <View style={styles.schedulesSection}>
        <Text style={styles.schedulesTitle}>
          {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
        </Text>
        <ScrollView style={styles.schedulesList}>
          {selectedSchedules.length > 0 ? (
            selectedSchedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <View style={[
                  styles.scheduleTypeBadge,
                  { backgroundColor: schedule.type === 'work' ? '#E6F0FF' : '#E6F7F1' }
                ]}>
                  <Text style={[
                    styles.scheduleTypeText,
                    { color: schedule.type === 'work' ? '#0064FF' : '#12805C' }
                  ]}>
                    {schedule.type === 'work' ? '작업' : '순찰'}
                  </Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                  <Text style={styles.scheduleTime}>{schedule.time}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptySchedule}>
              <Text style={styles.emptyScheduleText}>일정이 없습니다</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: '#0064FF',
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  calendarContainer: {
    paddingHorizontal: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6E6E6E',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayCellSelected: {
    backgroundColor: '#0064FF',
    borderRadius: 20,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#0064FF',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextToday: {
    color: '#0064FF',
    fontWeight: '600',
  },
  sundayText: {
    color: '#C9252D',
  },
  saturdayText: {
    color: '#0064FF',
  },
  scheduleIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0064FF',
    marginTop: 2,
  },
  schedulesSection: {
    flex: 1,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    marginTop: 8,
  },
  schedulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  schedulesList: {
    flex: 1,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  scheduleTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  scheduleTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 12,
    color: '#6E6E6E',
  },
  emptySchedule: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyScheduleText: {
    fontSize: 14,
    color: '#6E6E6E',
  },
});
