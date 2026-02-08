/**
 * Design Tokens 정의
 *
 * HDC Insite 브랜드 컬러 및 디자인 시스템 토큰
 * PRD 요구사항에 따른 시니어 모드 지원을 위한 확장 가능한 구조
 */
import { createTokens } from 'tamagui';

/**
 * 색상 토큰
 * HDC Insite 브랜드 컬러 시스템
 */
const colors = {
  // 브랜드 컬러
  primary: '#0066CC', // HDC Blue
  primaryLight: '#3388DD',
  primaryDark: '#004C99',

  secondary: '#FF6B00', // Orange
  secondaryLight: '#FF8533',
  secondaryDark: '#CC5500',

  // 시맨틱 컬러
  success: '#28A745',
  successLight: '#48C766',
  successDark: '#1E7B34',

  warning: '#FFC107',
  warningLight: '#FFD54F',
  warningDark: '#CC9A06',

  error: '#DC3545',
  errorLight: '#E35D6A',
  errorDark: '#B02A37',

  info: '#17A2B8',
  infoLight: '#3FB8CB',
  infoDark: '#117A8B',

  // 그레이 스케일 (50-900)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // 기본 컬러
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

/**
 * 스페이싱 토큰
 * 4px 베이스 그리드 시스템
 */
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  true: 16, // 기본값
};

/**
 * 사이즈 토큰
 * 컴포넌트 크기 정의
 */
const size = {
  0: 0,
  0.25: 2,
  0.5: 4,
  0.75: 8,
  1: 20,
  1.5: 24,
  2: 28,
  2.5: 32,
  3: 36,
  3.5: 40,
  4: 44, // 기본 터치 영역 (44px)
  4.5: 48,
  5: 52,
  5.5: 56,
  6: 64,
  7: 74,
  8: 84,
  9: 94,
  10: 104,
  11: 124,
  12: 144,
  13: 164,
  14: 184,
  15: 204,
  16: 224,
  17: 244,
  18: 264,
  19: 284,
  20: 304,
  true: 44, // 기본 터치 영역
};

/**
 * 라디우스 토큰
 * 모서리 둥글기
 */
const radius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  true: 8, // 기본값
  full: 9999,
};

/**
 * Z-Index 토큰
 */
const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
};

export const tokens = createTokens({
  color: colors,
  space: spacing,
  size,
  radius,
  zIndex,
});

/**
 * 시니어 모드용 스케일 팩터
 * PRD 요구사항: 1.2배 확대
 */
export const SENIOR_SCALE_FACTOR = 1.2;

/**
 * 시니어 모드 터치 영역 크기
 * PRD 요구사항: 44px → 53px
 */
export const SENIOR_TOUCH_TARGET = Math.round(44 * SENIOR_SCALE_FACTOR); // 53px
