/**
 * 로그인 화면
 *
 * 시니어 친화적 디자인 (따뜻한 색상, 고대비, 큰 터치 영역)
 */
import React, { useEffect, useState } from 'react';
import {
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  View,
} from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { User, Lock, Check, Eye, EyeOff } from '@tamagui/lucide-icons';
import { APP_NAME } from '@/constants/config';
import { useAuthStore } from '@/stores/auth.store';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

// 시니어 친화적 색상 팔레트
const COLORS = {
  background: '#F5F0E8',
  primary: '#D35400',
  primaryDark: '#A84300',
  textPrimary: '#2C2C2C',
  textSecondary: '#5C5C5C',
  textMuted: '#8C8C8C',
  inputBackground: '#FFFFFF',
  inputBorder: '#CCCCCC',
  error: '#C0392B',
  errorBg: '#FADBD8',
  serverDot: '#27AE60',
};

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { login, isLoading, error } = useLogin();
  const { isSeniorMode, fontSize, touchTarget } = useSeniorStyles();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Login] 인증 성공 -> 홈 화면으로 이동');
      requestAnimationFrame(() => {
        router.replace('/(main)/(home)');
      });
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    setFormError(null);

    if (!userId.trim()) {
      setFormError('아이디를 입력하세요');
      return;
    }
    if (!password.trim()) {
      setFormError('비밀번호를 입력하세요');
      return;
    }

    console.log('[Login] 로그인 시도:', userId);
    await login({
      userId: userId.trim(),
      passwd: password,
    });
  };

  if (isAuthenticated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textSecondary }}>
          로그인 중...
        </Text>
      </View>
    );
  }

  const displayError = formError || error;

  // 시니어 모드 스타일 계산
  const inputHeight = isSeniorMode ? touchTarget.button : 56;
  const buttonHeight = isSeniorMode ? touchTarget.button + 8 : 56;
  const labelSize = isSeniorMode ? fontSize.medium : 16;
  const inputFontSize = isSeniorMode ? fontSize.medium : 17;
  const buttonFontSize = isSeniorMode ? fontSize.large : 18;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 로고 영역 */}
        <YStack alignItems="center" marginBottom={32}>
          <YStack alignItems="center" marginBottom={16}>
            <Text
              style={{
                fontSize: isSeniorMode ? 44 : 36,
                fontWeight: '800',
                color: COLORS.primary,
                letterSpacing: -1,
              }}
            >
              {APP_NAME}
            </Text>
            <Text
              style={{
                fontSize: isSeniorMode ? 16 : 14,
                color: COLORS.textSecondary,
                marginTop: 4,
              }}
            >
              시설관리 시스템
            </Text>
          </YStack>

          {/* 서버 상태 */}
          <XStack
            alignItems="center"
            paddingVertical={8}
            paddingHorizontal={16}
            borderRadius={20}
            style={{
              backgroundColor: COLORS.inputBackground,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.serverDot,
                marginRight: 8,
              }}
            />
            <Text
              style={{
                fontSize: isSeniorMode ? 14 : 12,
                color: COLORS.textSecondary,
                fontWeight: '500',
              }}
            >
              서버 연결됨
            </Text>
          </XStack>
        </YStack>

        {/* 로그인 카드 */}
        <YStack
          borderRadius={24}
          padding={24}
          style={{
            backgroundColor: COLORS.inputBackground,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* 에러 메시지 */}
          {displayError && (
            <View
              style={{
                backgroundColor: COLORS.errorBg,
                borderWidth: isSeniorMode ? 2 : 1,
                borderColor: COLORS.error,
                borderRadius: 12,
                padding: isSeniorMode ? 18 : 14,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: isSeniorMode ? fontSize.medium : 15,
                  color: COLORS.error,
                  fontWeight: '500',
                }}
              >
                ⚠️ {displayError}
              </Text>
            </View>
          )}

          {/* 아이디 입력 */}
          <YStack marginBottom={20}>
            <Text
              style={{
                fontSize: labelSize,
                fontWeight: '600',
                color: COLORS.textPrimary,
                marginBottom: 8,
              }}
            >
              아이디
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.inputBackground,
                borderWidth: isSeniorMode ? 3 : 2,
                borderColor: COLORS.inputBorder,
                borderRadius: isSeniorMode ? 16 : 14,
                paddingHorizontal: 16,
                height: inputHeight,
              }}
            >
              <User
                size={isSeniorMode ? 26 : 22}
                color={COLORS.textSecondary as never}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: inputFontSize,
                  color: COLORS.textPrimary,
                  paddingLeft: 12,
                  fontWeight: isSeniorMode ? '500' : '400',
                }}
                placeholder="아이디를 입력하세요"
                placeholderTextColor={COLORS.textMuted}
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </YStack>

          {/* 비밀번호 입력 */}
          <YStack marginBottom={20}>
            <Text
              style={{
                fontSize: labelSize,
                fontWeight: '600',
                color: COLORS.textPrimary,
                marginBottom: 8,
              }}
            >
              비밀번호
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.inputBackground,
                borderWidth: isSeniorMode ? 3 : 2,
                borderColor: COLORS.inputBorder,
                borderRadius: isSeniorMode ? 16 : 14,
                paddingHorizontal: 16,
                height: inputHeight,
              }}
            >
              <Lock
                size={isSeniorMode ? 26 : 22}
                color={COLORS.textSecondary as never}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: inputFontSize,
                  color: COLORS.textPrimary,
                  paddingLeft: 12,
                  paddingRight: 50,
                  fontWeight: isSeniorMode ? '500' : '400',
                }}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <Pressable
                style={{ position: 'absolute', right: 16, padding: 4 }}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={isSeniorMode ? 24 : 20} color={COLORS.textSecondary as never} />
                ) : (
                  <Eye size={isSeniorMode ? 24 : 20} color={COLORS.textSecondary as never} />
                )}
              </Pressable>
            </View>
          </YStack>

          {/* 옵션 행 */}
          <XStack justifyContent="space-between" alignItems="center" marginBottom={24}>
            {/* 자동 로그인 */}
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setAutoLogin(!autoLogin)}
            >
              <View
                style={{
                  width: isSeniorMode ? 28 : 24,
                  height: isSeniorMode ? 28 : 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: autoLogin ? COLORS.primary : COLORS.inputBorder,
                  backgroundColor: autoLogin ? COLORS.primary : COLORS.inputBackground,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                }}
              >
                {autoLogin && <Check size={isSeniorMode ? 20 : 16} color="#FFFFFF" />}
              </View>
              <Text
                style={{
                  fontSize: isSeniorMode ? fontSize.medium : 15,
                  color: COLORS.textPrimary,
                  fontWeight: '500',
                }}
              >
                자동 로그인
              </Text>
            </Pressable>

            {/* 개인정보처리방침 */}
            <Pressable style={{ paddingVertical: 4 }}>
              <Text
                style={{
                  fontSize: isSeniorMode ? fontSize.small : 14,
                  color: COLORS.textSecondary,
                  textDecorationLine: 'underline',
                }}
              >
                개인정보처리방침
              </Text>
            </Pressable>
          </XStack>

          {/* 로그인 버튼 */}
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? COLORS.primaryDark : COLORS.primary,
              borderRadius: 14,
              height: buttonHeight,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isLoading ? 0.6 : 1,
              transform: pressed ? [{ scale: 0.98 }] : [],
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: buttonFontSize, fontWeight: '700' }}>
                로그인
              </Text>
            )}
          </Pressable>

          {/* 구분선 */}
          <XStack alignItems="center" marginVertical={24}>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.inputBorder }} />
            <Text
              style={{
                marginHorizontal: 16,
                fontSize: isSeniorMode ? 16 : 14,
                color: COLORS.textMuted,
                fontWeight: '500',
              }}
            >
              또는
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.inputBorder }} />
          </XStack>

          {/* 기간제 근로자 로그인 */}
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? COLORS.primary : '#E67E22',
              borderRadius: 14,
              height: buttonHeight,
              justifyContent: 'center',
              alignItems: 'center',
            })}
            onPress={() => router.push('/(auth)/guest-login')}
          >
            <Text style={{ color: '#FFFFFF', fontSize: buttonFontSize, fontWeight: '700' }}>
              기간제 근로자 로그인
            </Text>
          </Pressable>
        </YStack>

        {/* 하단 정보 */}
        <YStack alignItems="center" marginTop="auto" paddingTop={24}>
          <Text style={{ fontSize: isSeniorMode ? 14 : 12, color: COLORS.textMuted }}>
            HDC Labs
          </Text>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
