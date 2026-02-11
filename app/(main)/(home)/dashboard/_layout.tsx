/**
 * 대시보드 탭 레이아웃
 *
 * 알람 대시보드와 운영 대시보드 탭 네비게이션
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { XStack, Text } from 'tamagui';

/**
 * 탭 아이콘 컴포넌트
 */
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderBottomWidth={focused ? 2 : 0}
      borderBottomColor="$primary"
    >
      <Text
        fontSize={15}
        fontWeight={focused ? '600' : '400'}
        color={focused ? '$primary' : '$gray600'}
      >
        {name}
      </Text>
    </XStack>
  );
}

/**
 * 대시보드 탭 레이아웃
 */
export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 48,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '운영',
          tabBarIcon: ({ focused }) => <TabIcon name="운영" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="alarm"
        options={{
          title: '알람',
          tabBarIcon: ({ focused }) => <TabIcon name="알람" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
