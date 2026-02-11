/**
 * 시니어 모드 전용 스타일 상수 정의
 *
 * 시니어 UX 가이드라인 기반:
 * - 최소 폰트 크기 18px
 * - 색상 대비 4.5:1 이상
 * - 터치 영역 56px 이상
 * - 아이콘 크기 32px 이상
 * - 애니메이션 최소화
 *
 * 참조:
 * - https://toss.tech/article/senior-usability-research
 * - https://www.nngroup.com/reports/senior-citizens-on-the-web/
 */

/**
 * 시니어 모드 폰트 크기
 * 기존 크기 대비 약 1.3배 이상 확대, 최소 18px 보장
 */
export const SENIOR_FONT_SIZE = {
  /** 기본 작은 텍스트: 18px (기존 14px) */
  small: 18,
  /** 기본 중간 텍스트: 20px (기존 16px) */
  medium: 20,
  /** 기본 큰 텍스트: 24px (기존 18px) */
  large: 24,
  /** 강조 텍스트: 28px (기존 20px) */
  xlarge: 28,
  /** 제목: 32px (기존 24px) */
  title: 32,
  /** 대제목: 36px (기존 28px) */
  hero: 36,
} as const;

/**
 * 시니어 모드 간격
 * 요소 간 충분한 여백으로 터치 실수 방지
 */
export const SENIOR_SPACING = {
  /** 버튼 사이 간격: 12px 이상 */
  buttonGap: 12,
  /** 섹션 간 간격: 28px */
  sectionGap: 28,
  /** 카드 내부 패딩: 24px */
  cardPadding: 24,
  /** 리스트 아이템 간격: 16px */
  listItemGap: 16,
  /** 인라인 요소 간격: 12px */
  inlineGap: 12,
} as const;

/**
 * 시니어 모드 터치 영역
 * 손가락 정확도가 낮아도 쉽게 터치 가능한 크기
 */
export const SENIOR_TOUCH_TARGET = {
  /** 최소 터치 영역: 56px */
  min: 56,
  /** 버튼 높이: 60px */
  button: 60,
  /** 탭바 높이: 72px */
  tabBar: 72,
  /** 리스트 아이템 높이: 72px */
  listItem: 72,
  /** 아이콘 버튼 크기: 56px */
  iconButton: 56,
} as const;

/**
 * 시니어 모드 아이콘 크기
 * 시인성을 위해 확대된 아이콘 크기
 */
export const SENIOR_ICON_SIZE = {
  /** 작은 아이콘: 28px */
  small: 28,
  /** 중간 아이콘: 32px */
  medium: 32,
  /** 큰 아이콘: 40px */
  large: 40,
  /** 탭바 아이콘: 32px */
  tabBar: 32,
  /** 이모지/심볼: 36px */
  emoji: 36,
} as const;

/**
 * 시니어 모드 고대비 색상
 * 파란색 계열 대신 더 진하고 선명한 색상 사용
 * 고령자는 파란색 계열이 희미하게 보이는 경향이 있음
 */
export const SENIOR_COLORS = {
  /** 주요 색상: 더 진한 파란색 (4.5:1 이상 대비) */
  primary: '#004D99',
  /** 주요 색상 밝은 버전 */
  primaryLight: '#0066CC',
  /** 주요 색상 어두운 버전 */
  primaryDark: '#003366',

  /** 강조 색상: 진한 오렌지 */
  accent: '#CC5500',
  /** 강조 색상 밝은 버전 */
  accentLight: '#FF6B00',

  /** 기본 텍스트: 완전한 검정 (최대 대비) */
  text: '#000000',
  /** 보조 텍스트: 진한 회색 (4.5:1 대비) */
  textSecondary: '#333333',
  /** 비활성 텍스트: 중간 회색 */
  textMuted: '#555555',

  /** 기본 테두리: 눈에 잘 띄는 회색 */
  border: '#666666',
  /** 강조 테두리: 검정 (클릭 가능 요소 표시용) */
  borderStrong: '#000000',
  /** 버튼 테두리: 검정 (클릭 가능 표시) */
  buttonBorder: '#000000',

  /** 성공 상태: 진한 녹색 */
  success: '#006633',
  /** 경고 상태: 진한 주황 */
  warning: '#CC6600',
  /** 오류 상태: 진한 빨강 */
  error: '#CC0000',

  /** 배경: 순백 */
  background: '#FFFFFF',
  /** 카드 배경: 매우 밝은 회색 */
  cardBackground: '#FAFAFA',
  /** 비활성 배경 */
  disabledBackground: '#E5E5E5',
} as const;

/**
 * 시니어 모드 버튼 스타일
 * 테두리로 클릭 가능 영역 명확히 표시
 */
export const SENIOR_BUTTON_STYLE = {
  /** 버튼 높이 */
  height: 60,
  /** 버튼 테두리 두께 */
  borderWidth: 2,
  /** 버튼 모서리 반경 */
  borderRadius: 12,
  /** 버튼 수평 패딩 */
  paddingHorizontal: 24,
  /** 버튼 폰트 크기 */
  fontSize: 20,
  /** 버튼 폰트 굵기 */
  fontWeight: '700' as const,
} as const;

/**
 * 시니어 모드 카드 스타일
 * 명확한 영역 구분과 넓은 터치 영역
 */
export const SENIOR_CARD_STYLE = {
  /** 카드 패딩 */
  padding: 24,
  /** 카드 테두리 두께 */
  borderWidth: 2,
  /** 카드 테두리 색상 */
  borderColor: SENIOR_COLORS.border,
  /** 카드 모서리 반경 */
  borderRadius: 16,
  /** 카드 그림자 강화 */
  shadowOpacity: 0.15,
  /** 카드 그림자 반경 */
  shadowRadius: 8,
} as const;

/**
 * 시니어 모드 탭바 스타일
 */
export const SENIOR_TAB_BAR_STYLE = {
  /** 탭바 높이 (iOS) */
  heightIOS: 100,
  /** 탭바 높이 (Android) */
  heightAndroid: 80,
  /** 탭 아이콘 크기 */
  iconSize: 32,
  /** 탭 라벨 폰트 크기 */
  labelSize: 14,
  /** 아이콘-라벨 간격 */
  gap: 6,
} as const;

/**
 * 시니어 모드 Quick Action 라벨 매핑
 * 이모지 대신 명확한 텍스트 사용
 */
export const SENIOR_LABELS = {
  /** 작업지시 */
  work: '작업지시',
  /** 순찰점검 */
  patrol: '순찰점검',
  /** 대시보드 */
  dashboard: '대시보드',
  /** NFC 스캔 */
  nfcScan: 'NFC 태그',
  /** 알람 */
  alarm: '알람',
  /** 완료 */
  completed: '완료',
  /** 설정 */
  settings: '설정',
  /** 홈 */
  home: '홈',
  /** 내 작업 */
  myWork: '내 작업',
  /** 스캔 */
  scan: '스캔',
  /** 캘린더 */
  calendar: '캘린더',
  /** 진행중 */
  inProgress: '진행중',
  /** 뒤로가기 */
  back: '뒤로',
  /** 더보기 */
  more: '더보기',
  /** 전체보기 */
  viewAll: '전체보기',
} as const;

/**
 * 시니어 모드 접근성 아이콘 텍스트 매핑
 * 이모지 + 라벨 조합으로 더 명확하게
 */
export const SENIOR_ICONS = {
  work: { emoji: '📋', label: '작업' },
  patrol: { emoji: '🚶', label: '순찰' },
  alarm: { emoji: '🔔', label: '알람' },
  completed: { emoji: '✔️', label: '완료' },
  home: { emoji: '🏠', label: '홈' },
  settings: { emoji: '⚙️', label: '설정' },
  calendar: { emoji: '📅', label: '캘린더' },
  scan: { emoji: '📱', label: '스캔' },
  dashboard: { emoji: '📊', label: '대시보드' },
  nfc: { emoji: '📶', label: 'NFC' },
  back: { emoji: '←', label: '뒤로' },
  more: { emoji: '⋯', label: '더보기' },
} as const;

/**
 * 전체 시니어 모드 스타일 상수 내보내기
 */
export const SENIOR_STYLES = {
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
} as const;

export type SeniorFontSize = keyof typeof SENIOR_FONT_SIZE;
export type SeniorSpacing = keyof typeof SENIOR_SPACING;
export type SeniorTouchTarget = keyof typeof SENIOR_TOUCH_TARGET;
export type SeniorIconSize = keyof typeof SENIOR_ICON_SIZE;
export type SeniorColors = keyof typeof SENIOR_COLORS;
export type SeniorLabel = keyof typeof SENIOR_LABELS;
export type SeniorIcon = keyof typeof SENIOR_ICONS;

export default SENIOR_STYLES;
