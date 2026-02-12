/**
 * 홈 화면
 *
 * 2026 Modern UI - 그라디언트 헤더 + Glassmorphism 카드
 * 오늘의 요약, 진행 중인 작업, 순찰 상태 표시
 * Lucide Icons 사용
 *
 * 시니어 모드 지원:
 * - 확대된 텍스트와 터치 영역
 * - 고대비 색상
 * - 아이콘 + 텍스트 라벨 조합
 * - 테두리로 클릭 가능 요소 표시
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  RefreshControl,
  Platform,
  ViewStyle,
  View,
  Pressable,
  StyleSheet,
  TextStyle,
  Animated,
} from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { useNetworkStore } from '@/stores/network.store';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { QuickStatCard } from '@/components/ui/QuickStatCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LAYOUT } from '@/theme/tokens';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorStatusBadge } from '@/components/ui/SeniorCard';
import { AppIcon, type IconName } from '@/components/icons';
import { AttendanceCard, useAttendance } from '@/features/attendance';
import { startAutoSync } from '@/services/syncService';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { usePermission } from '@/hooks/usePermission';
import type { Permission } from '@/types/permission.types';

/**
 * 홈 화면
 */
export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const seniorStyles = useSeniorStyles();
  const { isSeniorMode } = seniorStyles;
  const { hasPermission, canShowQrAttendance } = usePermission();

  // 출퇴근 기능
  const {
    attendanceFlag,
    todayCheckIn,
    todayCheckOut,
    isProcessing,
    checkIn,
    checkOut,
    refreshAttendanceStatus,
  } = useAttendance();

  // 탭바 높이 (컨텐츠 하단 패딩용)
  const { contentPaddingBottom } = useTabBarHeight();

  // 네트워크 모니터링 시작
  const startMonitoring = useNetworkStore((state) => state.startMonitoring);

  useEffect(() => {
    // 네트워크 모니터링 시작
    const unsubscribeNetwork = startMonitoring();
    // 자동 동기화 시작
    const unsubscribeSync = startAutoSync();
    // 출퇴근 상태 새로고침
    refreshAttendanceStatus();

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, [startMonitoring, refreshAttendanceStatus]);

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // 출퇴근 상태 새로고침
    await refreshAttendanceStatus();
    // TODO: 실제 데이터 갱신
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, [refreshAttendanceStatus]);

  // Mock 데이터 (실제로는 API에서 가져옴)
  const todayStats = {
    work: 5,
    patrol: 2,
    alarm: 1,
    completed: 3,
  };

  const inProgressWork = {
    id: 1,
    title: '공조기 정기점검',
    location: 'A동 3층',
    progress: 80,
  };

  const todayPatrol = {
    id: 1,
    title: 'A동 정기순찰',
    floorsTotal: 5,
    floorsCompleted: 2,
  };

  // 권한 기반 빠른 실행 메뉴 정의
  const allQuickActions: Array<{
    icon: IconName;
    label: string;
    description?: string;
    route: string;
    permission: Permission;
  }> = [
    { icon: 'work', label: '작업지시', description: '작업 목록 보기', route: '/(main)/(home)/work', permission: 'workOrder' },
    { icon: 'patrol', label: '순찰점검', description: '순찰 목록 보기', route: '/(main)/(home)/patrol', permission: 'patrol' },
    { icon: 'document', label: '일상업무', description: '일상업무 현황', route: '/(main)/(home)/personal-task', permission: 'personalTask' },
    { icon: 'notice', label: '고객불편', description: '고객불편 접수', route: '/(main)/(home)/claim', permission: 'claim' },
    { icon: 'settings', label: '설비정보', description: '설비 조회', route: '/(main)/(home)/facility', permission: 'facility' },
    { icon: 'success', label: '승인/확인', description: '업무 승인', route: '/(main)/(home)/approval', permission: 'approval' },
    { icon: 'dashboard', label: '대시보드', description: '통계 보기', route: '/(main)/(home)/dashboard', permission: 'dashboard' },
    { icon: 'warning', label: '경보현황', description: '경보 확인', route: '/(main)/(home)/dashboard/alarm', permission: 'dashboardAlarm' },
  ];

  // 권한에 따라 필터링된 메뉴
  const filteredQuickActions = allQuickActions.filter((action) => hasPermission(action.permission));

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        subtitle="안녕하세요,"
        title={`${user?.name ?? '사용자'}님`}
        expandedHeight={120}
        collapsedHeight={80}
        rightAction={
          <YStack
            backgroundColor="$glassWhite20"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={12}
            borderWidth={1}
            borderColor="$glassWhite30"
          >
            <Text fontSize={12} fontWeight="600" color="$white">
              {user?.siteName ?? '현장'}
            </Text>
          </YStack>
        }
      />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary.val}
            colors={[theme.primary.val]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 출퇴근 카드 - 출퇴근 QR 권한 있는 사용자만 표시 */}
        {canShowQrAttendance && (
          <View style={{ marginTop: 16 }}>
            <AttendanceCard
              todayCheckIn={todayCheckIn}
              todayCheckOut={todayCheckOut}
              canCheckIn={attendanceFlag.login}
              canCheckOut={attendanceFlag.logOut}
              isProcessing={isProcessing}
              onCheckIn={() => checkIn('QR')}
              onCheckOut={() => checkOut('QR')}
            />
          </View>
        )}

        {/* 오늘의 요약 (Glass Card) */}
        <View>
          <GlassCard
            marginHorizontal={LAYOUT.CARD_SPACING}
            floating
            intensity="heavy"
          >
            <Text fontSize={15} fontWeight="700" color="$gray900" marginBottom="$4">
              오늘의 업무 현황
            </Text>
            <XStack gap="$3">
              <QuickStatCard
                icon="work"
                value={todayStats.work}
                label="작업"
                variant="primary"
                onPress={() => router.push('/(main)/(home)/work')}
              />
              <QuickStatCard
                icon="patrol"
                value={todayStats.patrol}
                label="순찰"
                variant="accent"
                onPress={() => router.push('/(main)/(home)/patrol')}
              />
              <QuickStatCard
                icon="warning"
                value={todayStats.alarm}
                label="알람"
                variant="warning"
                onPress={() => router.push('/(main)/(home)/dashboard/alarm')}
              />
              <QuickStatCard
                icon="success"
                value={todayStats.completed}
                label="완료"
                variant="success"
              />
            </XStack>
          </GlassCard>
        </View>

        {/* 빠른 실행 - 권한 기반 메뉴 표시 */}
        <View>
          <YStack paddingHorizontal="$5" marginTop="$6">
            <SectionHeader
              title="빠른 실행"
              showAccent
              // 시니어 모드: 더 큰 제목
              fontSize={isSeniorMode ? seniorStyles.fontSize.large : undefined}
            />
            {isSeniorMode ? (
              // 시니어 모드: 2열 그리드로 더 큰 버튼
              <YStack gap="$4">
                {/* 2개씩 그룹핑하여 행으로 표시 */}
                {Array.from({ length: Math.ceil(filteredQuickActions.length / 2) }, (_, rowIndex) => (
                  <XStack key={rowIndex} gap="$4">
                    {filteredQuickActions.slice(rowIndex * 2, rowIndex * 2 + 2).map((action) => (
                      <SeniorQuickActionButton
                        key={action.label}
                        icon={action.icon}
                        label={action.label}
                        description={action.description || ''}
                        onPress={() => router.push(action.route as never)}
                      />
                    ))}
                    {/* 홀수개일 때 빈 공간 채우기 */}
                    {rowIndex === Math.ceil(filteredQuickActions.length / 2) - 1 &&
                      filteredQuickActions.length % 2 === 1 && <View style={{ flex: 1 }} />}
                  </XStack>
                ))}
              </YStack>
            ) : (
              // 일반 모드: 4열 그리드
              <YStack gap="$3">
                {/* 4개씩 그룹핑하여 행으로 표시 */}
                {Array.from({ length: Math.ceil(filteredQuickActions.length / 4) }, (_, rowIndex) => (
                  <XStack key={rowIndex} gap="$3">
                    {filteredQuickActions.slice(rowIndex * 4, rowIndex * 4 + 4).map((action) => (
                      <QuickActionButton
                        key={action.label}
                        icon={action.icon}
                        label={action.label}
                        onPress={() => router.push(action.route as never)}
                      />
                    ))}
                    {/* 빈 공간 채우기 */}
                    {Array.from({
                      length: Math.max(0, 4 - (filteredQuickActions.length - rowIndex * 4)),
                    }).map((_, idx) => (
                      <View key={`empty-${idx}`} style={{ flex: 1 }} />
                    ))}
                  </XStack>
                ))}
              </YStack>
            )}
          </YStack>
        </View>

        {/* 진행 중인 작업 - 작업권한 있는 사용자만 표시 */}
        {hasPermission('workOrder') && (
          <View>
            <YStack paddingHorizontal="$5" marginTop="$6">
              <SectionHeader
                title="진행 중인 작업"
                actionText="전체보기"
                onAction={() => router.push('/(main)/(home)/work')}
                showAccent
                fontSize={isSeniorMode ? seniorStyles.fontSize.large : undefined}
              />
              {isSeniorMode ? (
                <SeniorWorkInProgressCard
                  title={inProgressWork.title}
                  location={inProgressWork.location}
                  progress={inProgressWork.progress}
                  onPress={() => router.push(`/work/${inProgressWork.id}`)}
                />
              ) : (
                <WorkInProgressCard
                  title={inProgressWork.title}
                  location={inProgressWork.location}
                  progress={inProgressWork.progress}
                  onPress={() => router.push(`/work/${inProgressWork.id}`)}
                />
              )}
            </YStack>
          </View>
        )}

        {/* 오늘의 순찰 - 순찰권한 있는 사용자만 표시 */}
        {hasPermission('patrol') && (
          <View>
            <YStack paddingHorizontal="$5" marginTop="$6">
              <SectionHeader
                title="오늘의 순찰"
                actionText="전체보기"
                onAction={() => router.push('/(main)/(home)/patrol')}
                showAccent
                fontSize={isSeniorMode ? seniorStyles.fontSize.large : undefined}
              />
              {isSeniorMode ? (
                <SeniorPatrolStatusCard
                  title={todayPatrol.title}
                  floorsTotal={todayPatrol.floorsTotal}
                  floorsCompleted={todayPatrol.floorsCompleted}
                  onPress={() => router.push(`/patrol/${todayPatrol.id}`)}
                />
              ) : (
                <PatrolStatusCard
                  title={todayPatrol.title}
                  floorsTotal={todayPatrol.floorsTotal}
                  floorsCompleted={todayPatrol.floorsCompleted}
                  onPress={() => router.push(`/patrol/${todayPatrol.id}`)}
                />
              )}
            </YStack>
          </View>
        )}

        {/* 공지사항 */}
        <View>
          <YStack paddingHorizontal="$5" marginTop="$6">
            <SectionHeader
              title="공지사항"
              showAccent
              fontSize={isSeniorMode ? seniorStyles.fontSize.large : undefined}
            />
            {isSeniorMode ? (
              <SeniorNoticeCard
                title="시스템 점검 안내"
                content="2026년 2월 15일 새벽 2시~4시 시스템 점검이 예정되어 있습니다."
                date="2026-02-08"
              />
            ) : (
              <NoticeCard
                title="시스템 점검 안내"
                content="2026년 2월 15일 새벽 2시~4시 시스템 점검이 예정되어 있습니다."
                date="2026-02-08"
              />
            )}
          </YStack>
        </View>
      </Animated.ScrollView>
    </YStack>
  );
}

/**
 * 빠른 실행 버튼
 */
interface QuickActionButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  const theme = useTheme();

  return (
    <YStack
      flex={1}
      backgroundColor="$surface"
      borderRadius={16}
      padding="$3"
      alignItems="center"
      gap="$2"
      pressStyle={{ opacity: 0.8, scale: 0.97 }}
      onPress={onPress}
      style={
        Platform.select({
          ios: {
            shadowColor: theme.primary.val,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          },
          android: {
            elevation: 3,
          },
        }) as ViewStyle
      }
    >
      <AppIcon name={icon} size="md" color="$primary" />
      <Text fontSize={12} fontWeight="500" color="$gray700">
        {label}
      </Text>
    </YStack>
  );
}

/**
 * 진행 중인 작업 카드
 */
interface WorkInProgressCardProps {
  title: string;
  location: string;
  progress: number;
  onPress: () => void;
}

function WorkInProgressCard({ title, location, progress, onPress }: WorkInProgressCardProps) {
  const theme = useTheme();

  return (
    <YStack
      backgroundColor="$surface"
      borderRadius={20}
      padding="$4"
      pressStyle={{ opacity: 0.95, scale: 0.99 }}
      onPress={onPress}
      style={
        Platform.select({
          ios: {
            shadowColor: theme.primary.val,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
          },
          android: {
            elevation: 6,
          },
        }) as ViewStyle
      }
    >
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
        <YStack flex={1} gap="$1">
          <XStack gap="$2" alignItems="center">
            <AppIcon name="maintenance" size="sm" color="$primary" />
            <Text fontSize={16} fontWeight="700" color="$gray900" letterSpacing={-0.3}>
              {title}
            </Text>
          </XStack>
          <XStack gap="$2" alignItems="center">
            <Text fontSize={13} color="$gray500">
              {location}
            </Text>
            <Text fontSize={13} color="$gray300">
              |
            </Text>
            <XStack alignItems="center" gap="$1">
              <YStack width={8} height={8} borderRadius={4} backgroundColor="$secondary" />
              <Text fontSize={13} color="$secondary" fontWeight="600">
                진행중
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </XStack>

      <ProgressBar progress={progress} variant="accent" height={8} glow animated />

      <Text fontSize={12} color="$gray500" textAlign="right" marginTop="$2">
        {progress}% 완료
      </Text>
    </YStack>
  );
}

/**
 * 순찰 상태 카드
 */
interface PatrolStatusCardProps {
  title: string;
  floorsTotal: number;
  floorsCompleted: number;
  onPress: () => void;
}

function PatrolStatusCard({ title, floorsTotal, floorsCompleted, onPress }: PatrolStatusCardProps) {
  const theme = useTheme();
  const progress = Math.round((floorsCompleted / floorsTotal) * 100);

  return (
    <YStack
      backgroundColor="$surface"
      borderRadius={20}
      padding="$4"
      pressStyle={{ opacity: 0.95, scale: 0.99 }}
      onPress={onPress}
      style={
        Platform.select({
          ios: {
            shadowColor: theme.primary.val,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
          },
          android: {
            elevation: 6,
          },
        }) as ViewStyle
      }
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2" alignItems="center" flex={1}>
          <AppIcon name="patrol" size="sm" color="$accent" />
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="700" color="$gray900" letterSpacing={-0.3}>
              {title}
            </Text>
            <Text fontSize={13} color="$gray500">
              {floorsTotal}층 중 {floorsCompleted}층 완료
            </Text>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap="$1">
          <YStack width={8} height={8} borderRadius={4} backgroundColor="$secondary" />
          <Text fontSize={13} color="$secondary" fontWeight="600">
            진행중
          </Text>
        </XStack>
      </XStack>

      <YStack marginTop="$3">
        <ProgressBar progress={progress} variant="primary" height={6} animated />
      </YStack>
    </YStack>
  );
}

/**
 * 공지사항 카드
 */
interface NoticeCardProps {
  title: string;
  content: string;
  date: string;
}

function NoticeCard({ title, content, date }: NoticeCardProps) {
  const theme = useTheme();

  return (
    <YStack
      backgroundColor="$surface"
      borderRadius={16}
      padding="$4"
      style={
        Platform.select({
          ios: {
            shadowColor: theme.primary.val,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          },
          android: {
            elevation: 3,
          },
        }) as ViewStyle
      }
    >
      <Text fontSize={15} fontWeight="700" color="$gray900" marginBottom="$2">
        {title}
      </Text>
      <Text fontSize={14} color="$gray600" lineHeight={20} marginBottom="$2">
        {content}
      </Text>
      <Text fontSize={12} color="$gray400">
        {date}
      </Text>
    </YStack>
  );
}

// ============================================================================
// 시니어 모드 전용 컴포넌트
// React Native 네이티브 컴포넌트 사용 (타입 호환성)
// ============================================================================

/**
 * 시니어 모드 빠른 실행 버튼
 *
 * 더 큰 터치 영역, 설명 텍스트 포함, 테두리로 클릭 가능 표시
 */
interface SeniorQuickActionButtonProps {
  icon: IconName;
  label: string;
  description: string;
  onPress: () => void;
}

function SeniorQuickActionButton({
  icon,
  label,
  description,
  onPress,
}: SeniorQuickActionButtonProps) {
  const seniorStyles = useSeniorStyles();
  const [isPressed, setIsPressed] = React.useState(false);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: seniorStyles.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: isPressed ? seniorStyles.colors.primary : seniorStyles.colors.border,
    minHeight: seniorStyles.touchTarget.min,
    transform: [{ scale: isPressed ? 0.96 : 1 }],
    opacity: isPressed ? 0.85 : 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: isPressed ? 1 : 3 },
        shadowOpacity: 0.2,
        shadowRadius: isPressed ? 2 : 6,
      },
      android: {
        elevation: isPressed ? 2 : 5,
      },
    }),
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={containerStyle}
    >
      {/* 아이콘 */}
      <AppIcon name={icon} size={seniorStyles.iconSize.emoji} color="$primary" />

      {/* 라벨 (메인) */}
      <Text
        style={
          {
            fontSize: seniorStyles.fontSize.medium,
            fontWeight: '700',
            color: seniorStyles.colors.text,
          } as TextStyle
        }
      >
        {label}
      </Text>

      {/* 설명 텍스트 */}
      <Text
        style={
          {
            fontSize: seniorStyles.fontSize.small,
            color: seniorStyles.colors.textSecondary,
          } as TextStyle
        }
      >
        {description}
      </Text>
    </Pressable>
  );
}

/**
 * 시니어 모드 진행 중인 작업 카드
 */
function SeniorWorkInProgressCard({ title, location, progress, onPress }: WorkInProgressCardProps) {
  const seniorStyles = useSeniorStyles();
  const [isPressed, setIsPressed] = React.useState(false);

  const containerStyle: ViewStyle = {
    backgroundColor: seniorStyles.colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: isPressed ? seniorStyles.colors.primary : seniorStyles.colors.border,
    transform: [{ scale: isPressed ? 0.98 : 1 }],
    opacity: isPressed ? 0.9 : 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: isPressed ? 2 : 4 },
        shadowOpacity: 0.2,
        shadowRadius: isPressed ? 4 : 8,
      },
      android: {
        elevation: isPressed ? 3 : 6,
      },
    }),
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={containerStyle}
    >
      {/* 헤더 */}
      <View style={seniorHomeStyles.cardHeader}>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={seniorHomeStyles.rowCenter}>
            <AppIcon name="maintenance" size={seniorStyles.iconSize.medium} color="$primary" />
            <Text
              style={
                {
                  fontSize: seniorStyles.fontSize.large,
                  fontWeight: '700',
                  color: seniorStyles.colors.text,
                  letterSpacing: -0.3,
                  marginLeft: 12,
                } as TextStyle
              }
            >
              {title}
            </Text>
          </View>
          <View style={seniorHomeStyles.rowCenter}>
            <Text
              style={
                {
                  fontSize: seniorStyles.fontSize.medium,
                  color: seniorStyles.colors.textSecondary,
                } as TextStyle
              }
            >
              {location}
            </Text>
            <Text
              style={
                {
                  fontSize: seniorStyles.fontSize.medium,
                  color: seniorStyles.colors.textMuted,
                  marginHorizontal: 12,
                } as TextStyle
              }
            >
              |
            </Text>
            <SeniorStatusBadge status="inProgress" label="진행중" />
          </View>
        </View>
      </View>

      {/* 진행률 바 */}
      <ProgressBar progress={progress} variant="accent" height={12} glow animated />

      {/* 진행률 텍스트 */}
      <Text
        style={
          {
            fontSize: seniorStyles.fontSize.medium,
            fontWeight: '600',
            color: seniorStyles.colors.textSecondary,
            textAlign: 'right',
            marginTop: 12,
          } as TextStyle
        }
      >
        {progress}% 완료
      </Text>
    </Pressable>
  );
}

/**
 * 시니어 모드 순찰 상태 카드
 */
function SeniorPatrolStatusCard({
  title,
  floorsTotal,
  floorsCompleted,
  onPress,
}: PatrolStatusCardProps) {
  const seniorStyles = useSeniorStyles();
  const [isPressed, setIsPressed] = React.useState(false);
  const progress = Math.round((floorsCompleted / floorsTotal) * 100);

  const containerStyle: ViewStyle = {
    backgroundColor: seniorStyles.colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: isPressed ? seniorStyles.colors.primary : seniorStyles.colors.border,
    transform: [{ scale: isPressed ? 0.98 : 1 }],
    opacity: isPressed ? 0.9 : 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: isPressed ? 2 : 4 },
        shadowOpacity: 0.2,
        shadowRadius: isPressed ? 4 : 8,
      },
      android: {
        elevation: isPressed ? 3 : 6,
      },
    }),
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={containerStyle}
    >
      {/* 헤더 */}
      <View style={seniorHomeStyles.cardHeaderRow}>
        <View style={seniorHomeStyles.rowCenterFlex}>
          <AppIcon name="patrol" size={seniorStyles.iconSize.medium} color="$accent" />
          <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
            <Text
              style={
                {
                  fontSize: seniorStyles.fontSize.large,
                  fontWeight: '700',
                  color: seniorStyles.colors.text,
                  letterSpacing: -0.3,
                } as TextStyle
              }
            >
              {title}
            </Text>
            <Text
              style={
                {
                  fontSize: seniorStyles.fontSize.medium,
                  color: seniorStyles.colors.textSecondary,
                } as TextStyle
              }
            >
              {floorsTotal}층 중 {floorsCompleted}층 완료
            </Text>
          </View>
        </View>
        <SeniorStatusBadge status="inProgress" label="진행중" />
      </View>

      {/* 진행률 바 */}
      <ProgressBar progress={progress} variant="primary" height={10} animated />
    </Pressable>
  );
}

/**
 * 시니어 모드 공지사항 카드
 */
function SeniorNoticeCard({ title, content, date }: NoticeCardProps) {
  const seniorStyles = useSeniorStyles();

  const containerStyle: ViewStyle = {
    backgroundColor: seniorStyles.colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: seniorStyles.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  };

  return (
    <View style={containerStyle}>
      <View style={seniorHomeStyles.noticeHeader}>
        <AppIcon name="notice" size={seniorStyles.iconSize.medium} color="$warning" />
        <Text
          style={
            {
              fontSize: seniorStyles.fontSize.large,
              fontWeight: '700',
              color: seniorStyles.colors.text,
              marginLeft: 12,
            } as TextStyle
          }
        >
          {title}
        </Text>
      </View>
      <Text
        style={
          {
            fontSize: seniorStyles.fontSize.medium,
            color: seniorStyles.colors.textSecondary,
            lineHeight: seniorStyles.fontSize.medium * 1.5,
            marginBottom: 12,
          } as TextStyle
        }
      >
        {content}
      </Text>
      <Text
        style={
          {
            fontSize: seniorStyles.fontSize.small,
            color: seniorStyles.colors.textMuted,
          } as TextStyle
        }
      >
        {date}
      </Text>
    </View>
  );
}

/**
 * 시니어 홈 화면 스타일
 */
const seniorHomeStyles = StyleSheet.create({
  cardHeader: {
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCenterFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});
