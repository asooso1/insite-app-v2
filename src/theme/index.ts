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
} from './tokens';

// 폰트
export { baseFont, seniorFont, fontSizes, fontWeights, lineHeights } from './fonts';

// 테마
export { lightTheme, seniorLightTheme, themes } from './themes';
export type { BaseTheme, ThemeName } from './themes';
