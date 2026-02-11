/**
 * 시니어 모드 컨텍스트
 *
 * 시니어 모드 상태를 앱 전체에서 사용할 수 있도록 제공합니다.
 * - 폰트 스케일 팩터 제공
 * - useUIStore의 isSeniorMode 구독
 * - useSeniorStyles() 훅으로 시니어 모드 전용 스타일 제공
 *
 * 시니어 UX 가이드라인 기반:
 * - 최소 폰트 크기 18px
 * - 색상 대비 4.5:1 이상
 * - 터치 영역 56px 이상
 * - 아이콘 + 텍스트 라벨 필수
 */
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { SENIOR_SCALE_FACTOR } from '@/theme/tokens';
import {
  SENIOR_STYLES,
  SENIOR_FONT_SIZE,
  SENIOR_SPACING,
  SENIOR_TOUCH_TARGET,
  SENIOR_ICON_SIZE,
  SENIOR_COLORS,
  SENIOR_BUTTON_STYLE,
  SENIOR_CARD_STYLE,
  SENIOR_TAB_BAR_STYLE,
  SENIOR_LABELS,
  SENIOR_ICONS,
} from '@/theme/seniorMode';

interface SeniorModeContextValue {
  /** 시니어 모드 활성화 여부 */
  isSeniorMode: boolean;
  /** 폰트 스케일 팩터 (일반: 1.0, 시니어: 1.2) */
  fontScale: number;
  /** 시니어 모드 토글 함수 */
  toggleSeniorMode: () => void;
  /** 시니어 모드 전용 스타일 */
  seniorStyles: typeof SENIOR_STYLES;
}

const SeniorModeContext = createContext<SeniorModeContextValue | undefined>(undefined);

interface SeniorModeProviderProps {
  children: ReactNode;
}

/**
 * 시니어 모드 Provider
 *
 * useUIStore의 isSeniorMode를 구독하여 컨텍스트로 제공합니다.
 * 시니어 모드 전용 스타일도 함께 제공합니다.
 */
export function SeniorModeProvider({ children }: SeniorModeProviderProps) {
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);
  const toggleSeniorMode = useUIStore((state) => state.toggleSeniorMode);

  const fontScale = isSeniorMode ? SENIOR_SCALE_FACTOR : 1.0;

  // 시니어 스타일은 상수이므로 메모이제이션
  const value = useMemo(
    () => ({
      isSeniorMode,
      fontScale,
      toggleSeniorMode,
      seniorStyles: SENIOR_STYLES,
    }),
    [isSeniorMode, fontScale, toggleSeniorMode]
  );

  return <SeniorModeContext.Provider value={value}>{children}</SeniorModeContext.Provider>;
}

/**
 * 시니어 모드 상태를 가져오는 훅
 *
 * @returns {SeniorModeContextValue} 시니어 모드 상태와 폰트 스케일 팩터
 * @throws {Error} Provider 외부에서 사용 시 에러 발생
 *
 * @example
 * ```tsx
 * const { isSeniorMode, fontScale, seniorStyles } = useSeniorMode();
 * const fontSize = isSeniorMode ? seniorStyles.fontSize.medium : 16;
 * ```
 */
export function useSeniorMode(): SeniorModeContextValue {
  const context = useContext(SeniorModeContext);

  if (context === undefined) {
    throw new Error('useSeniorMode는 SeniorModeProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}

/**
 * 시니어 모드 전용 스타일 훅
 *
 * 시니어 모드가 활성화되었을 때만 시니어 스타일을 반환하고,
 * 비활성화 시에는 기본값을 반환합니다.
 *
 * @example
 * ```tsx
 * const { fontSize, colors, touchTarget } = useSeniorStyles();
 * // 시니어 모드: { fontSize: 20, colors: SENIOR_COLORS, touchTarget: 56 }
 * // 일반 모드: { fontSize: 16, colors: 기본색상, touchTarget: 44 }
 * ```
 */
export function useSeniorStyles() {
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);

  return useMemo(() => {
    if (isSeniorMode) {
      return {
        isSeniorMode: true,
        fontSize: SENIOR_FONT_SIZE,
        spacing: SENIOR_SPACING,
        touchTarget: SENIOR_TOUCH_TARGET,
        iconSize: SENIOR_ICON_SIZE,
        colors: SENIOR_COLORS,
        button: SENIOR_BUTTON_STYLE,
        card: SENIOR_CARD_STYLE,
        tabBar: SENIOR_TAB_BAR_STYLE,
        labels: SENIOR_LABELS,
        icons: SENIOR_ICONS,
      };
    }

    // 일반 모드 기본값
    return {
      isSeniorMode: false,
      fontSize: {
        small: 14,
        medium: 16,
        large: 18,
        xlarge: 20,
        title: 24,
        hero: 28,
      },
      spacing: {
        buttonGap: 8,
        sectionGap: 20,
        cardPadding: 16,
        listItemGap: 12,
        inlineGap: 8,
      },
      touchTarget: {
        min: 44,
        button: 48,
        tabBar: 64,
        listItem: 56,
        iconButton: 44,
      },
      iconSize: {
        small: 20,
        medium: 24,
        large: 32,
        tabBar: 24,
        emoji: 24,
      },
      colors: {
        primary: '#0066CC',
        primaryLight: '#00A3FF',
        primaryDark: '#004C99',
        accent: '#FF6B00',
        accentLight: '#FFB800',
        text: '#0F172A',
        textSecondary: '#64748B',
        textMuted: '#94A3B8',
        border: '#E2E8F0',
        borderStrong: '#CBD5E1',
        buttonBorder: '#0066CC',
        success: '#00C853',
        warning: '#FFB300',
        error: '#EF4444',
        background: '#FFFFFF',
        cardBackground: '#FFFFFF',
        disabledBackground: '#F1F5F9',
      },
      button: {
        height: 48,
        borderWidth: 0,
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '600' as const,
      },
      card: {
        padding: 16,
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: 16,
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      tabBar: {
        heightIOS: 84,
        heightAndroid: 64,
        iconSize: 24,
        labelSize: 11,
        gap: 4,
      },
      labels: SENIOR_LABELS, // 라벨은 동일하게 사용
      icons: SENIOR_ICONS, // 아이콘도 동일하게 사용
    };
  }, [isSeniorMode]);
}

/**
 * 조건부 스타일 유틸리티 훅
 *
 * 시니어 모드에 따라 다른 스타일을 반환합니다.
 *
 * @example
 * ```tsx
 * const style = useSeniorConditional(
 *   { fontSize: 20, padding: 24 }, // 시니어 모드
 *   { fontSize: 16, padding: 16 }  // 일반 모드
 * );
 * ```
 */
export function useSeniorConditional<T>(seniorValue: T, normalValue: T): T {
  const isSeniorMode = useUIStore((state) => state.isSeniorMode);
  return isSeniorMode ? seniorValue : normalValue;
}
