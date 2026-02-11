/**
 * 테마 시스템 통합 엔트리 포인트
 *
 * 2026 Modern UI - Premium Facility Management
 * 모든 테마 관련 내보내기를 여기서 관리
 */

// Tamagui 설정
export { default as config } from './tamagui.config';
export type { AppConfig } from './tamagui.config';

// 토큰
export {
  tokens,
  gradients,
  shadows,
  glassStyle,
  durations,
  easings,
  SENIOR_SCALE_FACTOR,
  SENIOR_TOUCH_TARGET,
  LAYOUT,
} from './tokens';

// 폰트
export { baseFont, seniorFont, fontSizes, fontWeights, lineHeights } from './fonts';

// 테마
export { lightTheme, seniorLightTheme, themes } from './themes';
export type { BaseTheme, ThemeName } from './themes';

// 시니어 모드 스타일
export {
  SENIOR_STYLES,
  SENIOR_FONT_SIZE,
  SENIOR_SPACING,
  SENIOR_TOUCH_TARGET as SENIOR_TOUCH_TARGET_V2,
  SENIOR_ICON_SIZE,
  SENIOR_COLORS,
  SENIOR_BUTTON_STYLE,
  SENIOR_CARD_STYLE,
  SENIOR_TAB_BAR_STYLE,
  SENIOR_LABELS,
  SENIOR_ICONS,
} from './seniorMode';
export type {
  SeniorFontSize,
  SeniorSpacing,
  SeniorTouchTarget,
  SeniorIconSize,
  SeniorColors,
  SeniorLabel,
  SeniorIcon,
} from './seniorMode';
