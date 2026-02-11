/**
 * 앱 전체 아이콘 시스템
 *
 * @tamagui/lucide-icons 기반 통일된 아이콘 세트
 * 시니어 모드 지원 (크기 자동 조절)
 */
import React from 'react';
import {
  Home,
  ClipboardList,
  Smartphone,
  Calendar,
  Settings,
  Footprints,
  Wrench,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Search,
  Bell,
  BellOff,
  Megaphone,
  Camera,
  QrCode,
  Inbox,
  WifiOff,
  Check,
  X,
  Loader,
  Circle,
  Flame,
  Info,
  ChevronRight,
  MapPin,
  User,
  Building,
  Clock,
  FileText,
  Shield,
  Scan,
  CircleDot,
} from '@tamagui/lucide-icons';
import { useSeniorMode } from '@/contexts/SeniorModeContext';

// 아이콘 이름 -> 컴포넌트 매핑
export const ICONS = {
  // 탭 네비게이션
  home: Home,
  work: ClipboardList,
  scan: Scan,
  calendar: Calendar,
  settings: Settings,

  // 기능 아이콘
  patrol: Footprints,
  maintenance: Wrench,
  dashboard: BarChart3,
  alarm: Bell,
  alarmOff: BellOff,
  notice: Megaphone,
  camera: Camera,
  qrCode: QrCode,
  nfc: Smartphone,
  search: Search,

  // 상태 아이콘
  success: CheckCircle,
  warning: AlertTriangle,
  error: X,
  info: Info,
  check: Check,
  loading: Loader,
  circle: Circle,
  inProgress: CircleDot,

  // 기타
  empty: Inbox,
  offline: WifiOff,
  fire: Flame,
  chevronRight: ChevronRight,
  location: MapPin,
  user: User,
  building: Building,
  clock: Clock,
  document: FileText,
  security: Shield,
} as const;

export type IconName = keyof typeof ICONS;

// 아이콘 크기 프리셋
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

// 시니어 모드 아이콘 크기
export const SENIOR_ICON_SIZES = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

interface AppIconProps {
  /** 아이콘 이름 */
  name: IconName;
  /** 아이콘 크기 (프리셋 또는 숫자) */
  size?: IconSize | number;
  /** 아이콘 색상 (Tamagui 토큰 또는 hex) */
  color?: string;
}

/**
 * 앱 전체 통일 아이콘 컴포넌트
 *
 * 시니어 모드 활성화 시 자동으로 크기가 확대됩니다.
 *
 * @example
 * ```tsx
 * <AppIcon name="home" size="md" color="$primary" />
 * <AppIcon name="work" size={24} color="#0066CC" />
 * ```
 */
export function AppIcon({ name, size = 'md', color = '$gray700' }: AppIconProps) {
  const { isSeniorMode } = useSeniorMode();
  const IconComponent = ICONS[name];

  const iconSize =
    typeof size === 'number' ? size : isSeniorMode ? SENIOR_ICON_SIZES[size] : ICON_SIZES[size];

  // Lucide Icons는 color prop에 문자열을 직접 받을 수 있음
  return <IconComponent size={iconSize} color={color as any} />;
}

interface TabIconProps {
  /** 아이콘 이름 */
  name: IconName;
  /** 포커스 상태 */
  focused: boolean;
}

/**
 * 탭바 아이콘 전용 컴포넌트
 *
 * 포커스 상태와 시니어 모드에 따라 스타일이 변경됩니다.
 *
 * @example
 * ```tsx
 * <TabIcon name="home" focused={true} />
 * ```
 */
export function TabIcon({ name, focused }: TabIconProps) {
  const { isSeniorMode } = useSeniorMode();
  const IconComponent = ICONS[name];
  const size = isSeniorMode ? 32 : 24;
  const color = focused ? '$primary' : '$gray500';

  return <IconComponent size={size} color={color as any} />;
}

/**
 * 아이콘 색상 가이드
 * - 기본: $gray700
 * - 활성: $primary
 * - 비활성: $gray400
 * - 성공: $success
 * - 경고: $warning
 * - 에러: $error
 */
export const ICON_COLORS = {
  default: '$gray700',
  active: '$primary',
  inactive: '$gray400',
  success: '$success',
  warning: '$warning',
  error: '$error',
  white: '$white',
} as const;

export default AppIcon;
