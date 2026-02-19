/**
 * Typography Tokens 정의
 *
 * 폰트 크기, 굵기, 행간 설정
 * 시니어 모드 지원을 위한 확장 가능한 구조
 */
import { createFont } from 'tamagui';
import { SENIOR_SCALE_FACTOR } from './tokens';

/**
 * 기본 폰트 크기 (픽셀)
 */
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

/**
 * 폰트 굵기
 */
const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * 행간 비율
 */
const lineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 44,
  '5xl': 56,
} as const;

/**
 * 자간
 */
const letterSpacing = {
  xs: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  '2xl': -0.5,
  '3xl': -0.5,
  '4xl': -1,
  '5xl': -1,
} as const;

/**
 * 기본 폰트 생성
 * System 폰트 사용 (iOS: San Francisco, Android: Roboto)
 */
export const baseFont = createFont({
  family: 'System',
  size: {
    1: fontSizes.xs,
    2: fontSizes.sm,
    3: fontSizes.md,
    4: fontSizes.lg,
    5: fontSizes.xl,
    6: fontSizes['2xl'],
    7: fontSizes['3xl'],
    8: fontSizes['4xl'],
    9: fontSizes['5xl'],
    true: fontSizes.md, // 기본값
  },
  lineHeight: {
    1: lineHeights.xs,
    2: lineHeights.sm,
    3: lineHeights.md,
    4: lineHeights.lg,
    5: lineHeights.xl,
    6: lineHeights['2xl'],
    7: lineHeights['3xl'],
    8: lineHeights['4xl'],
    9: lineHeights['5xl'],
    true: lineHeights.md,
  },
  weight: {
    1: fontWeights.normal,
    2: fontWeights.normal,
    3: fontWeights.normal,
    4: fontWeights.medium,
    5: fontWeights.medium,
    6: fontWeights.semibold,
    7: fontWeights.semibold,
    8: fontWeights.bold,
    9: fontWeights.bold,
    true: fontWeights.normal,
  },
  letterSpacing: {
    1: letterSpacing.xs,
    2: letterSpacing.sm,
    3: letterSpacing.md,
    4: letterSpacing.lg,
    5: letterSpacing.xl,
    6: letterSpacing['2xl'],
    7: letterSpacing['3xl'],
    8: letterSpacing['4xl'],
    9: letterSpacing['5xl'],
    true: letterSpacing.md,
  },
  face: {
    400: { normal: 'System' },
    500: { normal: 'System' },
    600: { normal: 'System' },
    700: { normal: 'System' },
  },
});

/**
 * 시니어 모드용 폰트 크기 생성
 * PRD 요구사항: 1.2배 확대
 */
const createSeniorFontSizes = () => {
  return {
    1: Math.round(fontSizes.xs * SENIOR_SCALE_FACTOR),
    2: Math.round(fontSizes.sm * SENIOR_SCALE_FACTOR),
    3: Math.round(fontSizes.md * SENIOR_SCALE_FACTOR),
    4: Math.round(fontSizes.lg * SENIOR_SCALE_FACTOR),
    5: Math.round(fontSizes.xl * SENIOR_SCALE_FACTOR),
    6: Math.round(fontSizes['2xl'] * SENIOR_SCALE_FACTOR),
    7: Math.round(fontSizes['3xl'] * SENIOR_SCALE_FACTOR),
    8: Math.round(fontSizes['4xl'] * SENIOR_SCALE_FACTOR),
    9: Math.round(fontSizes['5xl'] * SENIOR_SCALE_FACTOR),
    true: Math.round(fontSizes.md * SENIOR_SCALE_FACTOR),
  };
};

/**
 * 시니어 모드용 행간 생성
 */
const createSeniorLineHeights = () => {
  return {
    1: Math.round(lineHeights.xs * SENIOR_SCALE_FACTOR),
    2: Math.round(lineHeights.sm * SENIOR_SCALE_FACTOR),
    3: Math.round(lineHeights.md * SENIOR_SCALE_FACTOR),
    4: Math.round(lineHeights.lg * SENIOR_SCALE_FACTOR),
    5: Math.round(lineHeights.xl * SENIOR_SCALE_FACTOR),
    6: Math.round(lineHeights['2xl'] * SENIOR_SCALE_FACTOR),
    7: Math.round(lineHeights['3xl'] * SENIOR_SCALE_FACTOR),
    8: Math.round(lineHeights['4xl'] * SENIOR_SCALE_FACTOR),
    9: Math.round(lineHeights['5xl'] * SENIOR_SCALE_FACTOR),
    true: Math.round(lineHeights.md * SENIOR_SCALE_FACTOR),
  };
};

/**
 * 시니어 모드용 폰트
 */
export const seniorFont = createFont({
  family: 'System',
  size: createSeniorFontSizes(),
  lineHeight: createSeniorLineHeights(),
  weight: {
    1: fontWeights.normal,
    2: fontWeights.normal,
    3: fontWeights.normal,
    4: fontWeights.medium,
    5: fontWeights.medium,
    6: fontWeights.semibold,
    7: fontWeights.semibold,
    8: fontWeights.bold,
    9: fontWeights.bold,
    true: fontWeights.normal,
  },
  letterSpacing: {
    1: letterSpacing.xs,
    2: letterSpacing.sm,
    3: letterSpacing.md,
    4: letterSpacing.lg,
    5: letterSpacing.xl,
    6: letterSpacing['2xl'],
    7: letterSpacing['3xl'],
    8: letterSpacing['4xl'],
    9: letterSpacing['5xl'],
    true: letterSpacing.md,
  },
  face: {
    400: { normal: 'System' },
    500: { normal: 'System' },
    600: { normal: 'System' },
    700: { normal: 'System' },
  },
});

/**
 * 타이포그래피 계층 (제목/본문/캡션)
 * 컴포넌트에서 일관된 시각 언어 적용용
 */
export const typographyScale = {
  /** 대제목 (화면 타이틀) */
  title: { size: '2xl' as const, weight: 'semibold' as const, lineHeight: '2xl' as const },
  /** 소제목 (섹션 헤더) */
  subtitle: { size: 'lg' as const, weight: 'medium' as const, lineHeight: 'lg' as const },
  /** 본문 */
  body: { size: 'md' as const, weight: 'normal' as const, lineHeight: 'md' as const },
  /** 보조 텍스트 */
  caption: { size: 'sm' as const, weight: 'normal' as const, lineHeight: 'sm' as const },
  /** 캡션 (라벨, 힌트) */
  label: { size: 'xs' as const, weight: 'normal' as const, lineHeight: 'xs' as const },
} as const;

/**
 * 폰트 크기 내보내기 (유틸리티)
 */
export { fontSizes, fontWeights, lineHeights };
