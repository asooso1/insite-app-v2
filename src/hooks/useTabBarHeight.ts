/**
 * 탭바 높이 Hook
 *
 * 컨텐츠 영역의 하단 패딩 계산에 사용
 */
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@/stores/ui.store';
import { SENIOR_STYLES } from '@/theme/seniorMode';

export const useTabBarHeight = () => {
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);
  const insets = useSafeAreaInsets();

  // Android 네비게이션 바 높이
  const androidBottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : 0;

  // 탭바 높이
  const tabBarHeight = isSeniorMode
    ? Platform.select({
        ios: SENIOR_STYLES.tabBar.heightIOS,
        android: 60 + androidBottomInset,
      }) ?? 84
    : Platform.select({ ios: 84, android: 56 + androidBottomInset }) ?? 84;

  // 컨텐츠 하단 패딩 (탭바 높이 + 여유 공간)
  const contentPaddingBottom = tabBarHeight + 16;

  return {
    tabBarHeight,
    contentPaddingBottom,
    androidBottomInset,
  };
};

/**
 * 정적 탭바 높이 (Hook 없이 사용)
 * Android: 약 72-80px (네비게이션 바 포함)
 * iOS: 84px
 */
export const TAB_BAR_HEIGHT = Platform.select({
  ios: 84,
  android: 72,
}) ?? 84;

export const CONTENT_PADDING_BOTTOM = TAB_BAR_HEIGHT + 16;
