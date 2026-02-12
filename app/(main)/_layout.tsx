/**
 * Main Layout - Tab Navigator
 *
 * 5개 탭 (모든 화면에서 탭바 유지):
 * - 홈 (home) - 작업/순찰/대시보드 등 서브화면 포함
 * - 내 작업 (my-work)
 * - 스캔 (scan)
 * - 캘린더 (calendar)
 * - 설정 (settings)
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
 * Main Tab Navigator
 */
export default function MainLayout() {
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);

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
  const activeTintColor = isSeniorMode ? SENIOR_STYLES.colors.primary : '#0066CC';
  const inactiveTintColor = isSeniorMode ? SENIOR_STYLES.colors.textMuted : '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // @ts-expect-error expo-router href 타입 이슈
        href: null, // 기본적으로 모든 라우트를 탭에서 숨김
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
      {/* ===== 표시할 5개 탭 ===== */}
      <Tabs.Screen
        name="(home)"
        options={{
          href: '/(main)/(home)',
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(my-work)"
        options={{
          href: '/(main)/(my-work)',
          title: '내 작업',
          tabBarIcon: ({ focused }) => <TabIcon name="work" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(scan)"
        options={{
          href: '/(main)/(scan)',
          title: '스캔',
          tabBarIcon: ({ focused }) => <TabIcon name="scan" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(calendar)"
        options={{
          href: '/(main)/(calendar)',
          title: '캘린더',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          href: '/(main)/(settings)',
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
    height: Platform.select({ ios: 84, android: 64 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 24, android: 12 }),
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
