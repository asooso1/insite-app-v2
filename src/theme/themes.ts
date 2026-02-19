/**
 * 테마 정의
 *
 * 2026 Modern UI - Premium Facility Management
 * Light Theme (기본) 및 Senior Light Theme (시니어 모드)
 * Glassmorphism + 그라디언트 기반 현대적 테마
 *
 * 애니메이션: durations.screenTransition (300ms) - src/theme/tokens.ts
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
  primaryMuted: color.primaryMuted,

  secondary: color.secondary,
  secondaryLight: color.secondaryLight,
  secondaryDark: color.secondaryDark,
  secondaryMuted: color.secondaryMuted,

  // 시맨틱 컬러 - 모던 팔레트
  success: color.success,
  successLight: color.successLight,
  successDark: color.successDark,
  successMuted: color.successMuted,

  warning: color.warning,
  warningLight: color.warningLight,
  warningDark: color.warningDark,
  warningMuted: color.warningMuted,

  error: color.error,
  errorLight: color.errorLight,
  errorDark: color.errorDark,
  errorMuted: color.errorMuted,

  info: color.info,
  infoLight: color.infoLight,
  infoDark: color.infoDark,
  infoMuted: color.infoMuted,

  // 그레이 스케일 - 쿨 그레이
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
 * 2026 Modern UI - 밝고 깨끗한 느낌
 */
export const lightTheme = {
  ...baseTheme,

  // 배경색 - 서브틀한 그라디언트 베이스
  background: color.gray50, // #F8FAFC
  backgroundHover: color.gray100,
  backgroundPress: color.gray200,
  backgroundFocus: color.gray100,
  backgroundStrong: color.gray100,
  backgroundTransparent: 'rgba(248, 250, 252, 0)',
  backgroundSubtle: color.gray50,

  // Glassmorphism 배경
  backgroundGlass: 'rgba(255, 255, 255, 0.7)',
  backgroundGlassHover: 'rgba(255, 255, 255, 0.85)',
  backgroundGlassStrong: 'rgba(255, 255, 255, 0.9)',
  backgroundOverlay: 'rgba(15, 23, 42, 0.5)',

  // Surface (카드, 모달 등)
  surface: color.white,
  surfaceHover: color.gray50,
  surfacePress: color.gray100,
  surfaceElevated: color.white,

  // 텍스트 색상 - 고대비
  color: color.gray900, // #0F172A
  colorHover: color.gray800,
  colorPress: color.gray700,
  colorFocus: color.gray800,
  colorTransparent: 'rgba(15, 23, 42, 0)',

  // 보조 텍스트
  colorSecondary: color.gray600, // #475569
  colorTertiary: color.gray500,
  colorMuted: color.gray400,
  colorPlaceholder: color.gray400,
  colorDisabled: color.gray300,

  // 반전 텍스트 (다크 배경용)
  colorInverse: color.white,
  colorInverseSecondary: 'rgba(255, 255, 255, 0.8)',

  // 보더 - 소프트한 경계
  borderColor: color.gray200, // #E2E8F0
  borderColorHover: color.gray300,
  borderColorFocus: color.primary,
  borderColorPress: color.gray400,
  borderColorSubtle: color.gray100,

  // Glassmorphism 보더
  borderColorGlass: 'rgba(255, 255, 255, 0.3)',
  borderColorGlassStrong: 'rgba(255, 255, 255, 0.5)',

  // 그림자 - 브랜드 컬러 기반
  shadowColor: 'rgba(0, 102, 204, 0.08)',
  shadowColorHover: 'rgba(0, 102, 204, 0.12)',
  shadowColorStrong: 'rgba(0, 102, 204, 0.16)',
  shadowColorGlow: 'rgba(0, 163, 255, 0.3)',

  // 컴포넌트 사이즈
  minTouchTarget: 44,

  // 입력 필드 스타일
  inputBackground: color.white,
  inputBackgroundFocus: color.white,
  inputBorder: color.gray200,
  inputBorderFocus: color.primary,
  inputPlaceholder: color.gray400,

  // 버튼 스타일
  buttonPrimaryBackground: color.primary,
  buttonPrimaryBackgroundHover: color.primaryLight,
  buttonPrimaryText: color.white,
  buttonSecondaryBackground: color.secondary,
  buttonSecondaryBackgroundHover: color.secondaryLight,
  buttonSecondaryText: color.white,

  // 상태 표시 배경
  statusSuccessBackground: color.successMuted,
  statusWarningBackground: color.warningMuted,
  statusErrorBackground: color.errorMuted,
  statusInfoBackground: color.infoMuted,

  // 구분선
  divider: color.gray200,
  dividerStrong: color.gray300,

  // 아이콘
  icon: color.gray600,
  iconSecondary: color.gray400,
  iconPrimary: color.primary,
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
  background: color.white, // 더 밝은 배경
  backgroundHover: color.gray50,
  backgroundPress: color.gray100,
  backgroundFocus: color.gray50,
  backgroundStrong: color.gray100,
  backgroundTransparent: 'rgba(255, 255, 255, 0)',
  backgroundSubtle: color.gray50,

  // Glassmorphism 배경 (고대비)
  backgroundGlass: 'rgba(255, 255, 255, 0.9)',
  backgroundGlassHover: 'rgba(255, 255, 255, 0.95)',
  backgroundGlassStrong: 'rgba(255, 255, 255, 0.98)',
  backgroundOverlay: 'rgba(0, 0, 0, 0.6)',

  // Surface
  surface: color.white,
  surfaceHover: color.gray50,
  surfacePress: color.gray100,
  surfaceElevated: color.white,

  // 텍스트 색상 (더 진하게 - 고대비)
  color: color.black, // 완전한 블랙
  colorHover: color.gray900,
  colorPress: color.gray800,
  colorFocus: color.gray900,
  colorTransparent: 'rgba(0, 0, 0, 0)',

  // 보조 텍스트 (더 진하게 - 고대비)
  colorSecondary: color.gray700, // gray600 → gray700
  colorTertiary: color.gray600, // gray500 → gray600
  colorMuted: color.gray500, // gray400 → gray500
  colorPlaceholder: color.gray500,
  colorDisabled: color.gray400,

  // 반전 텍스트
  colorInverse: color.white,
  colorInverseSecondary: 'rgba(255, 255, 255, 0.9)',

  // 보더 (더 진하게 - 고대비)
  borderColor: color.gray300, // gray200 → gray300
  borderColorHover: color.gray400,
  borderColorFocus: color.primary,
  borderColorPress: color.gray500,
  borderColorSubtle: color.gray200,

  // Glassmorphism 보더 (고대비)
  borderColorGlass: 'rgba(0, 0, 0, 0.1)',
  borderColorGlassStrong: 'rgba(0, 0, 0, 0.2)',

  // 그림자 (동일)
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorHover: 'rgba(0, 0, 0, 0.15)',
  shadowColorStrong: 'rgba(0, 0, 0, 0.2)',
  shadowColorGlow: 'rgba(0, 102, 204, 0.4)',

  // 확대된 터치 영역
  minTouchTarget: SENIOR_TOUCH_TARGET, // 53px

  // 입력 필드 스타일 (고대비)
  inputBackground: color.white,
  inputBackgroundFocus: color.white,
  inputBorder: color.gray400,
  inputBorderFocus: color.primaryDark,
  inputPlaceholder: color.gray500,

  // 버튼 스타일 (고대비)
  buttonPrimaryBackground: color.primaryDark,
  buttonPrimaryBackgroundHover: color.primary,
  buttonPrimaryText: color.white,
  buttonSecondaryBackground: color.secondaryDark,
  buttonSecondaryBackgroundHover: color.secondary,
  buttonSecondaryText: color.white,

  // 상태 표시 배경 (고대비)
  statusSuccessBackground: color.successMuted,
  statusWarningBackground: color.warningMuted,
  statusErrorBackground: color.errorMuted,
  statusInfoBackground: color.infoMuted,

  // 구분선 (고대비)
  divider: color.gray300,
  dividerStrong: color.gray400,

  // 아이콘 (고대비)
  icon: color.gray700,
  iconSecondary: color.gray500,
  iconPrimary: color.primaryDark,
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
