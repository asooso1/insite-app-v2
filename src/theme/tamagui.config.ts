/**
 * Tamagui 설정 파일
 *
 * 테마 시스템 통합 및 시니어 모드 지원
 */
import { createTamagui } from 'tamagui';
import { shorthands } from '@tamagui/shorthands';
import { tokens } from './tokens';
import { baseFont, seniorFont } from './fonts';
import { themes } from './themes';

/**
 * Tamagui 설정 생성
 */
const config = createTamagui({
  tokens,
  themes,
  fonts: {
    // 기본 폰트 (일반 모드)
    body: baseFont,
    heading: baseFont,

    // 시니어 모드용 폰트
    seniorBody: seniorFont,
    seniorHeading: seniorFont,
  },
  shorthands,
  settings: {
    // 네이티브 최적화
    allowedStyleValues: 'somewhat-strict-web',
    autocompleteSpecificEnthalpyUnits: true,
  },
  media: {
    // 반응형 브레이크포인트 (모바일 우선)
    xs: { maxWidth: 375 },
    sm: { maxWidth: 640 },
    md: { maxWidth: 768 },
    lg: { maxWidth: 1024 },
    xl: { maxWidth: 1280 },
    xxl: { maxWidth: 1536 },

    // 화면 방향
    landscape: { orientation: 'landscape' },
    portrait: { orientation: 'portrait' },

    // 접근성
    reduceMotion: { prefersReducedMotion: 'reduce' },
  },
});

/**
 * Tamagui 타입 정의 (타입 안전성)
 */
export type AppConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
