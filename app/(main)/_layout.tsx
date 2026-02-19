/**
 * Main Layout - Tab Navigator
 *
 * 역할별 탭 구성:
 * - ADMIN/WORKER: 5개 탭 (홈, 내 작업, 스캔, 캘린더, 설정)
 * - PARTNER/EXTERNAL: 2개 탭 (홈, 설정)
 *
 * V1 MainContainer.js 참조
 */
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@/stores/ui.store';
import { SENIOR_STYLES } from '@/theme/seniorMode';
import { TabIcon } from '@/components/icons';
import { usePermission } from '@/hooks/usePermission';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

/**
 * 커스텀 탭바 배경 (글래스모피즘)
 * Android는 BlurView가 약해서 불투명 배경 사용
 */
function TabBarBackground() {
  if (Platform.OS === 'android') {
    // Android: 불투명 배경
    return (
      <BlurView
        intensity={100}
        tint="light"
        style={{
          ...StyleSheet.absoluteFillObject,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      />
    );
  }

  // iOS: 글래스모피즘
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
  const insets = useSafeAreaInsets();
  const { canAccessMyWorkTab, canAccessScanTab, canAccessCalendarTab } = usePermission();

  // 30분 미사용 시 자동 로그아웃
  useSessionTimeout();

  // Android 네비게이션 바 높이 반영 (최소값 설정)
  const androidBottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : 0;

  // 탭바 높이 계산
  const tabBarHeight = isSeniorMode
    ? Platform.select({
        ios: SENIOR_STYLES.tabBar.heightIOS,
        android: 60 + androidBottomInset, // Android 탭바 높이 줄임
      })
    : Platform.select({ ios: 84, android: 56 + androidBottomInset }); // 64 -> 56

  // 탭바 하단 패딩 (Android 네비게이션 바 영역)
  const tabBarPaddingBottom = isSeniorMode
    ? Platform.select({ ios: 28, android: 8 + androidBottomInset }) // 16 -> 8
    : Platform.select({ ios: 24, android: 6 + androidBottomInset }); // 12 -> 6

  // 탭바 상단 패딩 (아이콘 위 여백)
  const tabBarPaddingTop = isSeniorMode
    ? Platform.select({ ios: 12, android: 6 }) // Android: 12 -> 6
    : Platform.select({ ios: 8, android: 4 }); // Android: 8 -> 4

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
          paddingTop: tabBarPaddingTop,
        },
        tabBarLabelStyle: {
          ...styles.tabBarLabel,
          fontSize: tabBarLabelSize,
          fontWeight: isSeniorMode ? '700' : '600',
        },
        tabBarBackground: TabBarBackground,
      }}
    >
      {/* ===== 홈 탭 - 모든 역할 접근 가능 ===== */}
      <Tabs.Screen
        name="(home)"
        options={{
          href: '/(main)/(home)',
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />

      {/* ===== 내 작업 탭 - ADMIN/WORKER만 ===== */}
      <Tabs.Screen
        name="(my-work)"
        options={{
          href: canAccessMyWorkTab ? '/(main)/(my-work)' : null,
          title: '내 작업',
          tabBarIcon: ({ focused }) => <TabIcon name="work" focused={focused} />,
        }}
      />

      {/* ===== 스캔 탭 - ADMIN/WORKER만 ===== */}
      <Tabs.Screen
        name="(scan)"
        options={{
          href: canAccessScanTab ? '/(main)/(scan)' : null,
          title: '스캔',
          tabBarIcon: ({ focused }) => <TabIcon name="scan" focused={focused} />,
        }}
      />

      {/* ===== 캘린더 탭 - ADMIN/WORKER만 ===== */}
      <Tabs.Screen
        name="(calendar)"
        options={{
          href: canAccessCalendarTab ? '/(main)/(calendar)' : null,
          title: '캘린더',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />

      {/* ===== 설정 탭 - 모든 역할 접근 가능 ===== */}
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
