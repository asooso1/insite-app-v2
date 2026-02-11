/**
 * Design Tokens 정의
 *
 * HDC Insite 브랜드 컬러 및 디자인 시스템 토큰
 * 2026 Modern UI - Premium Facility Management
 */
import { createTokens } from 'tamagui';

/**
 * 색상 토큰
 * HDC Insite 브랜드 컬러 시스템 - 현대화
 */
const colors = {
  // 브랜드 컬러 - 그라디언트 기반
  primary: '#0066CC', // HDC Blue (base)
  primaryLight: '#00A3FF', // 그라디언트 엔드
  primaryDark: '#004C99',
  primaryMuted: '#E6F2FF', // 연한 배경용

  secondary: '#FF6B00', // Orange (base)
  secondaryLight: '#FFB800', // 그라디언트 엔드
  secondaryDark: '#CC5500',
  secondaryMuted: '#FFF3E6',

  // 시맨틱 컬러 - 모던 팔레트
  success: '#00C853', // 밝은 그린
  successLight: '#69F0AE',
  successDark: '#00A043',
  successMuted: '#E6FFF0',

  warning: '#FFB300', // 골든 옐로우
  warningLight: '#FFCA28',
  warningDark: '#FF8F00',
  warningMuted: '#FFF8E1',

  error: '#EF4444', // 모던 레드
  errorLight: '#F87171',
  errorDark: '#DC2626',
  errorMuted: '#FEE2E2',

  info: '#0EA5E9', // 스카이 블루
  infoLight: '#38BDF8',
  infoDark: '#0284C7',
  infoMuted: '#E0F2FE',

  // 그레이 스케일 (50-900) - 쿨 그레이
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Glass 스타일용 투명도 토큰
  glassWhite5: 'rgba(255, 255, 255, 0.05)',
  glassWhite8: 'rgba(255, 255, 255, 0.08)',
  glassWhite10: 'rgba(255, 255, 255, 0.1)',
  glassWhite15: 'rgba(255, 255, 255, 0.15)',
  glassWhite20: 'rgba(255, 255, 255, 0.2)',
  glassWhite25: 'rgba(255, 255, 255, 0.25)',
  glassWhite30: 'rgba(255, 255, 255, 0.3)',
  glassWhite40: 'rgba(255, 255, 255, 0.4)',
  glassWhite50: 'rgba(255, 255, 255, 0.5)',
  glassWhite70: 'rgba(255, 255, 255, 0.7)',
  glassWhite85: 'rgba(255, 255, 255, 0.85)',
  glassWhite90: 'rgba(255, 255, 255, 0.9)',

  glassBlack5: 'rgba(0, 0, 0, 0.05)',
  glassBlack10: 'rgba(0, 0, 0, 0.1)',
  glassBlack20: 'rgba(0, 0, 0, 0.2)',

  // 그라디언트 장식용 투명 컬러
  glassBlue10: 'rgba(0, 163, 255, 0.1)',
  glassBlue30: 'rgba(0, 163, 255, 0.3)',
  glassOrange5: 'rgba(255, 184, 0, 0.05)',
  glassOrange20: 'rgba(255, 107, 0, 0.2)',
  glassRed15: 'rgba(239, 68, 68, 0.15)',
  glassRed30: 'rgba(239, 68, 68, 0.3)',

  // 기본 컬러
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

/**
 * 그라디언트 정의
 * CSS 그라디언트 문자열 (React Native LinearGradient용 별도 배열)
 */
export const gradients = {
  // 브랜드 그라디언트
  primary: ['#0066CC', '#00A3FF'] as const,
  primaryVertical: ['#00A3FF', '#0066CC'] as const,
  primarySubtle: ['#E6F2FF', '#CCE5FF'] as const,

  accent: ['#FF6B00', '#FFB800'] as const,
  accentVertical: ['#FFB800', '#FF6B00'] as const,

  success: ['#00C853', '#69F0AE'] as const,
  error: ['#EF4444', '#F87171'] as const,
  warning: ['#FFB300', '#FFCA28'] as const,

  // Glassmorphism 배경
  glass: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)'] as const,
  glassDark: ['rgba(15, 23, 42, 0.8)', 'rgba(15, 23, 42, 0.6)'] as const,

  // 배경 그라디언트
  background: ['#F8FAFC', '#E2E8F0'] as const,
  backgroundDark: ['#0F172A', '#1E293B'] as const,

  // 특수 효과
  shimmer: [
    'rgba(255, 255, 255, 0)',
    'rgba(255, 255, 255, 0.5)',
    'rgba(255, 255, 255, 0)',
  ] as const,
  glow: ['rgba(0, 102, 204, 0.3)', 'rgba(0, 163, 255, 0.1)', 'rgba(0, 163, 255, 0)'] as const,
};

/**
 * 모던 섀도우 시스템
 * 깊이감과 플로팅 효과를 위한 다층 그림자
 */
export const shadows = {
  // 기본 섀도우
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  // 플로팅 효과 (카드, 모달용)
  floating: {
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  // 글로우 효과 (버튼 호버, 포커스용)
  glow: {
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  // 인셋 효과
  inset: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0,
  },
} as const;

/**
 * 스페이싱 토큰
 * 4px 베이스 그리드 시스템 - 확장
 */
const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  true: 16, // 기본값
};

/**
 * 레이아웃 상수
 * UI 레이아웃에서 반복적으로 사용되는 값들
 */
export const LAYOUT = {
  // 헤더 관련
  HEADER_PADDING: 16,
  HEADER_TOP_OFFSET: -32, // Glass Card 오버랩 오프셋
  HEADER_HEIGHT_DEFAULT: 180,

  // 컨텐츠 간격
  SECTION_SPACING: 24,
  CARD_SPACING: 20,

  // 하단 탭바 안전 영역
  TAB_BAR_BOTTOM: 100,

  // 장식 요소
  DECOR_CIRCLE_LARGE: 200,
  DECOR_CIRCLE_MEDIUM: 120,
  DECOR_CIRCLE_SMALL: 80,
} as const;

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
 * 라디우스 토큰 - 모던 라운딩
 */
const radius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  true: 12, // 기본값 (더 부드럽게)
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
  modal: 1000,
  toast: 1100,
  tooltip: 1200,
  overlay: 900,
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

/**
 * Glassmorphism 스타일 헬퍼
 */
export const glassStyle = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  heavy: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
} as const;

/**
 * 애니메이션 듀레이션 토큰
 */
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

/**
 * 애니메이션 이징 토큰
 */
export const easings = {
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;
