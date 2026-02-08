/**
 * 테마 정의
 *
 * Light Theme (기본) 및 Senior Light Theme (시니어 모드)
 * PRD 요구사항에 따른 고대비 색상 지원
 */
import { tokens, SENIOR_SCALE_FACTOR, SENIOR_TOUCH_TARGET } from './tokens';

// 색상 참조 헬퍼
const { color } = tokens;

/**
 * 기본 테마 공통 속성
 * 모든 테마에서 공유하는 기본 값
 */
const baseTheme = {
  // 브랜드 컬러
  primary: color.primary,
  primaryLight: color.primaryLight,
  primaryDark: color.primaryDark,

  secondary: color.secondary,
  secondaryLight: color.secondaryLight,
  secondaryDark: color.secondaryDark,

  // 시맨틱 컬러
  success: color.success,
  successLight: color.successLight,
  successDark: color.successDark,

  warning: color.warning,
  warningLight: color.warningLight,
  warningDark: color.warningDark,

  error: color.error,
  errorLight: color.errorLight,
  errorDark: color.errorDark,

  info: color.info,
  infoLight: color.infoLight,
  infoDark: color.infoDark,

  // 그레이 스케일
  gray50: color.gray50,
  gray100: color.gray100,
  gray200: color.gray200,
  gray300: color.gray300,
  gray400: color.gray400,
  gray500: color.gray500,
  gray600: color.gray600,
  gray700: color.gray700,
  gray800: color.gray800,
  gray900: color.gray900,

  // 기본
  white: color.white,
  black: color.black,
  transparent: color.transparent,
};

/**
 * Light Theme (기본 테마)
 * Tamagui v2는 plain object로 테마 정의
 */
export const lightTheme = {
  ...baseTheme,

  // 배경색
  background: color.white,
  backgroundHover: color.gray50,
  backgroundPress: color.gray100,
  backgroundFocus: color.gray50,
  backgroundStrong: color.gray100,
  backgroundTransparent: 'rgba(255, 255, 255, 0)',

  // 텍스트 색상
  color: color.gray900,
  colorHover: color.gray800,
  colorPress: color.gray700,
  colorFocus: color.gray800,
  colorTransparent: 'rgba(17, 24, 39, 0)',

  // 보조 텍스트
  colorSecondary: color.gray600,
  colorTertiary: color.gray500,
  colorMuted: color.gray400,
  colorPlaceholder: color.gray400,

  // 보더
  borderColor: color.gray200,
  borderColorHover: color.gray300,
  borderColorFocus: color.primary,
  borderColorPress: color.gray400,

  // 그림자 (투명도 조절)
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorHover: 'rgba(0, 0, 0, 0.15)',

  // 컴포넌트 사이즈
  minTouchTarget: 44,
} as const;

/**
 * Senior Light Theme (시니어 모드)
 *
 * PRD 요구사항:
 * - 폰트 크기 1.2배 확대 (fonts.ts에서 처리)
 * - 터치 영역 확대 (44px → 53px)
 * - 고대비 색상 옵션
 */
export const seniorLightTheme = {
  ...baseTheme,

  // 배경색 (동일)
  background: color.white,
  backgroundHover: color.gray50,
  backgroundPress: color.gray100,
  backgroundFocus: color.gray50,
  backgroundStrong: color.gray100,
  backgroundTransparent: 'rgba(255, 255, 255, 0)',

  // 텍스트 색상 (더 진하게 - 고대비)
  color: color.black, // gray900 → black으로 변경
  colorHover: color.gray900,
  colorPress: color.gray800,
  colorFocus: color.gray900,
  colorTransparent: 'rgba(0, 0, 0, 0)',

  // 보조 텍스트 (더 진하게 - 고대비)
  colorSecondary: color.gray700, // gray600 → gray700
  colorTertiary: color.gray600, // gray500 → gray600
  colorMuted: color.gray500, // gray400 → gray500
  colorPlaceholder: color.gray500, // gray400 → gray500

  // 보더 (더 진하게 - 고대비)
  borderColor: color.gray300, // gray200 → gray300
  borderColorHover: color.gray400,
  borderColorFocus: color.primary,
  borderColorPress: color.gray500,

  // 그림자 (동일)
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorHover: 'rgba(0, 0, 0, 0.15)',

  // 확대된 터치 영역
  minTouchTarget: SENIOR_TOUCH_TARGET, // 53px
} as const;

/**
 * 테마 타입 정의 (타입 안전성)
 */
export type BaseTheme = typeof lightTheme;
export type ThemeName = 'light' | 'seniorLight';

/**
 * 테마 객체
 */
export const themes = {
  light: lightTheme,
  seniorLight: seniorLightTheme,
} as const;

/**
 * 시니어 모드 스케일 팩터 내보내기
 */
export { SENIOR_SCALE_FACTOR, SENIOR_TOUCH_TARGET };
