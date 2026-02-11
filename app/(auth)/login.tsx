/**
 * 로그인 화면
 *
 * 순수 React Native 컴포넌트 사용 (Tamagui 제거)
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { APP_NAME } from '@/constants/config';
import { useAuthStore } from '@/stores/auth.store';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorButton } from '@/components/ui/SeniorButton';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  // ===== 모든 HOOKS를 최상단에서 호출 =====
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { login, isLoading, error } = useLogin();
  const { isSeniorMode, fontSize, touchTarget } = useSeniorStyles();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * 인증 상태 변경 시 홈 화면으로 리다이렉트
   * requestAnimationFrame으로 래핑하여 상태 업데이트와 네비게이션이 원활하게 처리되도록 함
   */
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Login] 인증 성공 -> 홈 화면으로 이동');
      requestAnimationFrame(() => {
        router.replace('/(main)/(tabs)/home');
      });
    }
  }, [isAuthenticated, router]);

  /**
   * 로그인 처리
   * - 폼 검증 후 로그인 API 호출
   * - 로그인 성공 시 useLogin 내부에서 setAuth 호출 -> isAuthenticated 변경 -> useEffect에서 네비게이션
   */
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

  // 인증된 상태면 로딩 화면 (리다이렉트 대기)
  if (isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0F172A', '#1E3A5F', '#0066CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const displayError = formError || error;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 그라디언트 배경 */}
      <LinearGradient
        colors={['#0F172A', '#1E3A5F', '#0066CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 장식용 원형 */}
      <View style={styles.decorativeCircle1}>
        <LinearGradient
          colors={['rgba(0, 163, 255, 0.3)', 'rgba(0, 102, 204, 0.1)']}
          style={styles.circleGradient}
        />
      </View>

      <View style={styles.decorativeCircle2}>
        <LinearGradient
          colors={['rgba(255, 107, 0, 0.2)', 'rgba(255, 184, 0, 0.05)']}
          style={styles.circleGradient}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 로고 영역 */}
        <View style={styles.header}>
          <Text style={styles.logoText}>{APP_NAME}</Text>
          <Text style={styles.subtitleText}>FACILITY MANAGEMENT</Text>
        </View>

        {/* 로그인 카드 */}
        <View style={styles.cardWrapper}>
          <BlurView intensity={40} tint="light" style={styles.blurView}>
            <View style={styles.glassCard}>
              {/* 서버 상태 */}
              <View style={styles.serverStatus}>
                <View style={styles.serverDot} />
                <Text style={styles.serverText}>스테이징 서버 연결됨</Text>
              </View>

              {/* 에러 메시지 - 시니어 모드 대응 */}
              {displayError && (
                <View
                  style={[
                    styles.errorBox,
                    isSeniorMode && {
                      paddingVertical: 18,
                      paddingHorizontal: 20,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text style={[styles.errorIcon, isSeniorMode && { fontSize: fontSize.large }]}>
                    !
                  </Text>
                  <Text style={[styles.errorText, isSeniorMode && { fontSize: fontSize.small }]}>
                    {displayError}
                  </Text>
                </View>
              )}

              {/* 로그인 폼 */}
              <View style={styles.form}>
                {/* 아이디 입력 - 시니어 모드 대응 */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isSeniorMode && { fontSize: fontSize.small }]}>
                    아이디
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      isSeniorMode && {
                        height: touchTarget.button,
                        fontSize: fontSize.small,
                        borderWidth: 2,
                        paddingHorizontal: 20,
                      },
                    ]}
                    placeholder="아이디를 입력하세요"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={userId}
                    onChangeText={setUserId}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                {/* 비밀번호 입력 - 시니어 모드 대응 */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isSeniorMode && { fontSize: fontSize.small }]}>
                    비밀번호
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        isSeniorMode && {
                          height: touchTarget.button,
                          fontSize: fontSize.small,
                          borderWidth: 2,
                          paddingHorizontal: 20,
                          paddingRight: 80,
                        },
                      ]}
                      placeholder="비밀번호를 입력하세요"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                    />
                    <Pressable
                      style={[styles.showPasswordButton, isSeniorMode && { right: 20 }]}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text
                        style={[
                          styles.showPasswordText,
                          isSeniorMode && { fontSize: fontSize.small },
                        ]}
                      >
                        {showPassword ? '숨김' : '보기'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* 로그인 버튼 - 시니어 모드 대응 */}
                {isSeniorMode ? (
                  <SeniorButton
                    label="로그인"
                    onPress={handleLogin}
                    disabled={isLoading}
                    loading={isLoading}
                    variant="primary"
                    fullWidth
                  />
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.loginButton,
                      pressed && styles.loginButtonPressed,
                      isLoading && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={isLoading ? ['#94A3B8', '#CBD5E1'] : ['#0066CC', '#00A3FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButtonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.loginButtonText}>로그인</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            </View>
          </BlurView>
        </View>

        {/* 하단 링크 - 시니어 모드 대응 */}
        <View style={styles.footer}>
          <Link href="/(auth)/guest-login" asChild>
            <Pressable
              style={[
                styles.guestButton,
                isSeniorMode && {
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
              ]}
            >
              <Text style={[styles.guestText, isSeniorMode && { fontSize: fontSize.small }]}>
                NFC 게스트 로그인
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.12,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 102, 204, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    letterSpacing: 2,
  },
  cardWrapper: {
    flex: 1,
    maxHeight: 440,
    marginVertical: 24,
  },
  blurView: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  glassCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // $glassWhite15 - RN StyleSheet에서는 토큰 직접 사용 불가
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)', // $glassWhite25
    padding: 28,
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // $glassWhite15
    marginBottom: 16,
  },
  serverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
  },
  serverText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    color: '#FCA5A5',
    fontWeight: 'bold',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FCA5A5',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  input: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // $glassWhite10
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)', // $glassWhite20
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showPasswordText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  loginButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  guestButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // $glassWhite10
    borderRadius: 24,
  },
  guestText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    overflow: 'hidden',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    overflow: 'hidden',
  },
  circleGradient: {
    width: '100%',
    height: '100%',
  },
});
