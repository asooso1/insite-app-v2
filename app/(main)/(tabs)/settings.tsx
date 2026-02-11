import { Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, ScrollView, Switch, Circle } from 'tamagui';
import { SText } from '@/components/ui/SText';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { APP_NAME, APP_VERSION } from '@/constants/config';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useAppUpdates } from '@/hooks/useAppUpdates';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '$background' }} edges={['top']}>
      {/* Header */}
      <YStack
        px="$4"
        py="$3"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$gray200"
      >
        <SText fontSize={24} fontWeight="700" color="$gray900">
          설정
        </SText>
      </YStack>

      <ScrollView flex={1}>
        {/* User Info Section */}
        <YStack backgroundColor="$background" mt="$4" px="$4" py="$4">
          <SText fontSize={14} fontWeight="600" color="$gray600" mb="$3">
            내 정보
          </SText>
          <XStack alignItems="center">
            <YStack
              width={60}
              height={60}
              borderRadius={30}
              backgroundColor="$primary"
              justifyContent="center"
              alignItems="center"
              mr="$4"
            >
              <SText fontSize={24} fontWeight="700" color="$white">
                {user?.name?.charAt(0) ?? 'U'}
              </SText>
            </YStack>
            <YStack flex={1}>
              <SText fontSize={18} fontWeight="600" color="$gray900" mb="$1">
                {user?.name ?? '사용자'}
              </SText>
              <SText fontSize={14} color="$gray600" mb={2}>
                {user?.email ?? ''}
              </SText>
              <SText fontSize={14} color="$primary">
                {user?.siteName ?? ''}
              </SText>
            </YStack>
          </XStack>
        </YStack>

        {/* Display Settings */}
        <YStack backgroundColor="$background" mt="$4" px="$4" py="$4">
          <SText fontSize={14} fontWeight="600" color="$gray600" mb="$3">
            화면 설정
          </SText>
          <XStack justifyContent="space-between" alignItems="center" py="$2">
            <YStack flex={1} mr="$4">
              <SText fontSize={16} fontWeight="500" color="$gray900" mb="$1">
                시니어 모드
              </SText>
              <SText fontSize={14} color="$gray600">
                글씨와 버튼을 크게 표시합니다
              </SText>
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

        {/* Notification Settings */}
        <YStack backgroundColor="$background" mt="$4" px="$4" py="$4">
          <SText fontSize={14} fontWeight="600" color="$gray600" mb="$3">
            알림 설정
          </SText>
          <XStack justifyContent="space-between" alignItems="center" py="$2">
            <YStack flex={1} mr="$4">
              <SText fontSize={16} fontWeight="500" color="$gray900" mb="$1">
                푸시 알림
              </SText>
              <SText fontSize={14} color="$gray600">
                {notificationEnabled ? '알림을 받고 있습니다' : '알림이 꺼져 있습니다'}
              </SText>
            </YStack>
            {notificationLoading ? (
              <ActivityIndicator size="small" color="$primary" />
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

        {/* App Info */}
        <YStack backgroundColor="$background" mt="$4" px="$4" py="$4">
          <SText fontSize={14} fontWeight="600" color="$gray600" mb="$3">
            앱 정보
          </SText>
          <YStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              py="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
            >
              <SText fontSize={16} color="$gray900">
                앱 이름
              </SText>
              <SText fontSize={16} color="$gray600">
                {APP_NAME}
              </SText>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              py="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
            >
              <SText fontSize={16} color="$gray900">
                버전
              </SText>
              <SText fontSize={16} color="$gray600">
                {APP_VERSION}
              </SText>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              py="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
              pressStyle={{ opacity: 0.7 }}
              onPress={
                updateDownloading ? undefined : isUpdateAvailable ? applyUpdate : checkUpdate
              }
            >
              <XStack alignItems="center" gap="$2">
                <SText fontSize={16} color="$gray900">
                  업데이트 확인
                </SText>
                {isUpdateAvailable && !updateDownloading && (
                  <Circle size={8} backgroundColor="$error" />
                )}
              </XStack>
              {updateChecking || updateDownloading ? (
                <ActivityIndicator size="small" color="$primary" />
              ) : (
                <SText fontSize={16} color="$gray300">
                  {'>'}
                </SText>
              )}
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              py="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
              pressStyle={{ opacity: 0.7 }}
            >
              <SText fontSize={16} color="$gray900">
                이용약관
              </SText>
              <SText fontSize={16} color="$gray300">
                {'>'}
              </SText>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              py="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
              pressStyle={{ opacity: 0.7 }}
            >
              <SText fontSize={16} color="$gray900">
                개인정보처리방침
              </SText>
              <SText fontSize={16} color="$gray300">
                {'>'}
              </SText>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              py="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
              pressStyle={{ opacity: 0.7 }}
            >
              <SText fontSize={16} color="$gray900">
                오픈소스 라이선스
              </SText>
              <SText fontSize={16} color="$gray300">
                {'>'}
              </SText>
            </XStack>
          </YStack>
        </YStack>

        {/* Logout */}
        <YStack backgroundColor="$background" mt="$4" px="$4" py="$4">
          <Button variant="ghost" onPress={handleLogout}>
            <SText fontSize={16} fontWeight="500" color="$error">
              로그아웃
            </SText>
          </Button>
        </YStack>

        {/* Bottom Padding */}
        <YStack height={32} />
      </ScrollView>
    </SafeAreaView>
  );
}
