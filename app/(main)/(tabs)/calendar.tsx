/**
 * 캘린더 화면
 *
 * 2026 Modern UI - CollapsibleGradientHeader 적용
 */
import React, { useState, useRef } from 'react';
import { View, Animated, Pressable } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';

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
  '2024-01-16': [{ id: '3', title: '전등 교체', type: 'work', time: '14:00' }],
};

export default function CalendarScreen() {
  const theme = useTheme();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

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
  const firstDayOfMonth = monthStart.getDay();

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="캘린더"
        expandedHeight={100}
        collapsedHeight={80}
      />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 월 네비게이션 */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$4"
          paddingVertical="$4"
        >
          <YStack
            width={44}
            height={44}
            borderRadius={22}
            backgroundColor="$white"
            justifyContent="center"
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={goToPreviousMonth}
          >
            <Text fontSize={20} color="$primary" fontWeight="600">{'<'}</Text>
          </YStack>
          <Text fontSize={18} fontWeight="600" color="$gray900">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </Text>
          <YStack
            width={44}
            height={44}
            borderRadius={22}
            backgroundColor="$white"
            justifyContent="center"
            alignItems="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={goToNextMonth}
          >
            <Text fontSize={20} color="$primary" fontWeight="600">{'>'}</Text>
          </YStack>
        </XStack>

        {/* 캘린더 그리드 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          borderRadius={16}
          padding="$3"
          borderWidth={1}
          borderColor="$gray200"
        >
          {/* 요일 헤더 */}
          <XStack marginBottom="$2">
            {weekDays.map((day, index) => (
              <YStack key={day} flex={1} alignItems="center" paddingVertical="$2">
                <Text
                  fontSize={14}
                  fontWeight="500"
                  color={index === 0 ? '$error' : index === 6 ? '$primary' : '$gray500'}
                >
                  {day}
                </Text>
              </YStack>
            ))}
          </XStack>

          {/* 날짜 그리드 */}
          <XStack flexWrap="wrap">
            {/* 빈 셀 */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <YStack key={`empty-${index}`} width="14.28%" aspectRatio={1} />
            ))}

            {/* 날짜 셀 */}
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const hasSchedule = mockSchedules[dateKey];
              const isSelected = isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <Pressable
                  key={dateKey}
                  style={{ width: '14.28%', aspectRatio: 1 }}
                  onPress={() => setSelectedDate(day)}
                >
                  <YStack
                    flex={1}
                    justifyContent="center"
                    alignItems="center"
                    borderRadius={20}
                    backgroundColor={isSelected ? '$primary' : isDayToday ? '$primaryMuted' : 'transparent'}
                  >
                    <Text
                      fontSize={16}
                      fontWeight={isSelected || isDayToday ? '600' : '400'}
                      color={
                        isSelected
                          ? '$white'
                          : isDayToday
                            ? '$primary'
                            : day.getDay() === 0
                              ? '$error'
                              : day.getDay() === 6
                                ? '$primary'
                                : '$gray900'
                      }
                    >
                      {format(day, 'd')}
                    </Text>
                    {hasSchedule && !isSelected && (
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: theme.primary.val,
                          marginTop: 2,
                        }}
                      />
                    )}
                  </YStack>
                </Pressable>
              );
            })}
          </XStack>
        </YStack>

        {/* 선택된 날짜의 일정 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          marginTop="$4"
          borderRadius={16}
          padding="$4"
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text fontSize={16} fontWeight="600" color="$gray900" marginBottom="$3">
            {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })}
          </Text>

          {selectedSchedules.length > 0 ? (
            <YStack gap="$2">
              {selectedSchedules.map((schedule) => (
                <XStack
                  key={schedule.id}
                  backgroundColor="$gray50"
                  borderRadius={10}
                  padding="$3"
                  alignItems="center"
                  gap="$3"
                >
                  <YStack
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius={6}
                    backgroundColor={schedule.type === 'work' ? '$primaryMuted' : '$successMuted'}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={schedule.type === 'work' ? '$primary' : '$success'}
                    >
                      {schedule.type === 'work' ? '작업' : '순찰'}
                    </Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text fontSize={14} fontWeight="500" color="$gray900">
                      {schedule.title}
                    </Text>
                    <Text fontSize={12} color="$gray500">
                      {schedule.time}
                    </Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          ) : (
            <YStack alignItems="center" paddingVertical="$6">
              <Text fontSize={14} color="$gray500">
                일정이 없습니다
              </Text>
            </YStack>
          )}
        </YStack>
      </Animated.ScrollView>
    </YStack>
  );
}
