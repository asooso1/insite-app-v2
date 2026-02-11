/**
 * Tab Navigator Layout
 *
 * 5개 탭:
 * - 홈 (home)
 * - 내 작업 (my-work)
 * - 스캔 (scan)
 * - 캘린더 (calendar)
 * - 설정 (settings)
 *
 * 2026 Modern Design:
 * - SafeArea 고려한 탭바 높이 (iOS 84, Android 64)
 * - 반투명 글래스 효과 (expo-blur)
 * - 그림자 효과
 * - 라운드 코너 (상단만)
 * - Tamagui 테마 색상 사용
 * - Lucide Icons 사용
 *
 * 시니어 모드 지원:
 * - 확대된 탭바 높이
 * - 더 큰 아이콘과 라벨
 * - 고대비 색상
 */
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useUIStore } from '@/stores/ui.store';
import { SENIOR_STYLES } from '@/theme/seniorMode';
import { TabIcon } from '@/components/icons';

/**
 * 커스텀 탭바 배경 (글래스모피즘)
 */
function TabBarBackground() {
  return (
    <BlurView
      intensity={80}
      tint="light"
      style={{
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
      }}
    />
  );
}

/**
 * Tab Navigator
 */
export default function TabsLayout() {
  // 시니어 모드 상태 구독
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);

  // 시니어 모드 스타일 계산
  const tabBarHeight = isSeniorMode
    ? Platform.select({
        ios: SENIOR_STYLES.tabBar.heightIOS,
        android: SENIOR_STYLES.tabBar.heightAndroid,
      })
    : Platform.select({ ios: 84, android: 64 });

  const tabBarPaddingBottom = isSeniorMode
    ? Platform.select({ ios: 28, android: 16 })
    : Platform.select({ ios: 24, android: 12 });

  const tabBarLabelSize = isSeniorMode ? SENIOR_STYLES.tabBar.labelSize : 11;

  // 시니어 모드 색상
  const activeTintColor = isSeniorMode ? SENIOR_STYLES.colors.primary : '#0066CC';

  const inactiveTintColor = isSeniorMode ? SENIOR_STYLES.colors.textMuted : '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarStyle: {
          ...styles.tabBar,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: isSeniorMode ? 12 : 8,
        },
        tabBarLabelStyle: {
          ...styles.tabBarLabel,
          fontSize: tabBarLabelSize,
          fontWeight: isSeniorMode ? '700' : '600',
        },
        tabBarBackground: TabBarBackground,
      }}
    >
      {/* 홈 */}
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />

      {/* 내 작업 */}
      <Tabs.Screen
        name="my-work"
        options={{
          title: '내 작업',
          tabBarIcon: ({ focused }) => <TabIcon name="work" focused={focused} />,
        }}
      />

      {/* 스캔 */}
      <Tabs.Screen
        name="scan"
        options={{
          title: '스캔',
          tabBarIcon: ({ focused }) => <TabIcon name="scan" focused={focused} />,
        }}
      />

      {/* 캘린더 */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />

      {/* 설정 */}
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    // SafeArea 고려한 높이 (iOS는 홈 인디케이터 공간 추가)
    height: Platform.select({ ios: 84, android: 64 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 24, android: 12 }),
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    // 상단 라운드 코너
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // 그림자 효과
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
