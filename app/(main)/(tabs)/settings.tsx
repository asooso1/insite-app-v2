/**
 * 설정 화면
 *
 * 2026 Modern UI - CollapsibleGradientHeader 적용
 */
import React, { useRef } from 'react';
import { Alert, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Switch, Circle, Text } from 'tamagui';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { useSeniorMode, useSeniorStyles } from '@/contexts/SeniorModeContext';
import { APP_NAME, APP_VERSION } from '@/constants/config';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useAppUpdates } from '@/hooks/useAppUpdates';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const { fontSize } = useSeniorStyles();

  // 스크롤 애니메이션
  const scrollY = useRef(new Animated.Value(0)).current;

  // 알림 설정
  const {
    isEnabled: notificationEnabled,
    isLoading: notificationLoading,
    toggleNotification,
  } = useNotificationSettings();

  // 앱 업데이트
  const {
    isUpdateAvailable,
    isChecking: updateChecking,
    isDownloading: updateDownloading,
    checkUpdate,
    applyUpdate,
  } = useAppUpdates();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 그라디언트 헤더 */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="설정"
        expandedHeight={100}
        collapsedHeight={80}
      />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 내 정보 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          marginTop="$4"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text fontSize={14} fontWeight="600" color="$gray500" marginBottom="$3">
            내 정보
          </Text>
          <XStack alignItems="center">
            <YStack
              width={60}
              height={60}
              borderRadius={30}
              backgroundColor="$primary"
              justifyContent="center"
              alignItems="center"
              marginRight="$4"
            >
              <Text fontSize={24} fontWeight="700" color="$white">
                {user?.name?.charAt(0) ?? 'U'}
              </Text>
            </YStack>
            <YStack flex={1}>
              <Text fontSize={isSeniorMode ? fontSize.large : 18} fontWeight="600" color="$gray900" marginBottom="$1">
                {user?.name ?? '사용자'}
              </Text>
              <Text fontSize={14} color="$gray500" marginBottom={2}>
                {user?.email ?? ''}
              </Text>
              <Text fontSize={14} color="$primary">
                {user?.siteName ?? ''}
              </Text>
            </YStack>
          </XStack>
        </YStack>

        {/* 화면 설정 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          marginTop="$4"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text fontSize={14} fontWeight="600" color="$gray500" marginBottom="$3">
            화면 설정
          </Text>
          <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
            <YStack flex={1} marginRight="$4">
              <Text fontSize={16} fontWeight="500" color="$gray900" marginBottom="$1">
                시니어 모드
              </Text>
              <Text fontSize={14} color="$gray500">
                글씨와 버튼을 크게 표시합니다
              </Text>
            </YStack>
            <Switch
              checked={isSeniorMode}
              onCheckedChange={toggleSeniorMode}
              backgroundColor={isSeniorMode ? '$primary' : '$gray300'}
            >
              <Switch.Thumb backgroundColor="$white" />
            </Switch>
          </XStack>
        </YStack>

        {/* 알림 설정 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          marginTop="$4"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text fontSize={14} fontWeight="600" color="$gray500" marginBottom="$3">
            알림 설정
          </Text>
          <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
            <YStack flex={1} marginRight="$4">
              <Text fontSize={16} fontWeight="500" color="$gray900" marginBottom="$1">
                푸시 알림
              </Text>
              <Text fontSize={14} color="$gray500">
                {notificationEnabled ? '알림을 받고 있습니다' : '알림이 꺼져 있습니다'}
              </Text>
            </YStack>
            {notificationLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Switch
                checked={notificationEnabled}
                onCheckedChange={toggleNotification}
                backgroundColor={notificationEnabled ? '$primary' : '$gray300'}
              >
                <Switch.Thumb backgroundColor="$white" />
              </Switch>
            )}
          </XStack>
        </YStack>

        {/* 앱 정보 */}
        <YStack
          backgroundColor="$white"
          marginHorizontal="$4"
          marginTop="$4"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$gray200"
        >
          <Text fontSize={14} fontWeight="600" color="$gray500" marginBottom="$3">
            앱 정보
          </Text>
          <YStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray100"
            >
              <Text fontSize={16} color="$gray900">앱 이름</Text>
              <Text fontSize={16} color="$gray500">{APP_NAME}</Text>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray100"
            >
              <Text fontSize={16} color="$gray900">버전</Text>
              <Text fontSize={16} color="$gray500">{APP_VERSION}</Text>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray100"
              pressStyle={{ opacity: 0.7 }}
              onPress={updateDownloading ? undefined : isUpdateAvailable ? applyUpdate : checkUpdate}
            >
              <XStack alignItems="center" gap="$2">
                <Text fontSize={16} color="$gray900">업데이트 확인</Text>
                {isUpdateAvailable && !updateDownloading && (
                  <Circle size={8} backgroundColor="$error" />
                )}
              </XStack>
              {updateChecking || updateDownloading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text fontSize={16} color="$gray300">{'>'}</Text>
              )}
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray100"
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={16} color="$gray900">이용약관</Text>
              <Text fontSize={16} color="$gray300">{'>'}</Text>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray100"
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={16} color="$gray900">개인정보처리방침</Text>
              <Text fontSize={16} color="$gray300">{'>'}</Text>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="$3"
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={16} color="$gray900">오픈소스 라이선스</Text>
              <Text fontSize={16} color="$gray300">{'>'}</Text>
            </XStack>
          </YStack>
        </YStack>

        {/* 로그아웃 */}
        <YStack
          marginHorizontal="$4"
          marginTop="$4"
        >
          <Button variant="ghost" onPress={handleLogout}>
            <Text fontSize={16} fontWeight="500" color="$error">
              로그아웃
            </Text>
          </Button>
        </YStack>
      </Animated.ScrollView>
    </YStack>
  );
}
