/**
 * 로그인 화면
 *
 * 시니어 친화적 디자인 (따뜻한 색상, 고대비, 큰 터치 영역)
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
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Lock, Check, Eye, EyeOff } from '@tamagui/lucide-icons';
import { APP_NAME } from '@/constants/config';
import { useAuthStore } from '@/stores/auth.store';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

// 시니어 친화적 색상 팔레트
const COLORS = {
  // 배경
  background: '#F5F0E8', // 따뜻한 아이보리
  backgroundDark: '#E8E0D4', // 살짝 어두운 아이보리

  // 주요 색상
  primary: '#D35400', // 주황 (버튼)
  primaryDark: '#A84300', // 눌렸을 때
  primaryLight: '#E67E22', // 호버

  // 텍스트
  textPrimary: '#2C2C2C', // 진한 회색
  textSecondary: '#5C5C5C', // 중간 회색
  textMuted: '#8C8C8C', // 연한 회색

  // 입력 필드
  inputBackground: '#FFFFFF',
  inputBorder: '#CCCCCC',
  inputBorderFocus: '#D35400',

  // 상태
  error: '#C0392B',
  errorBg: '#FADBD8',
  success: '#27AE60',

  // 서버 상태
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
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>로그인 중...</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 로고 영역 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, isSeniorMode && { fontSize: 44 }]}>{APP_NAME}</Text>
            <Text style={[styles.subtitleText, isSeniorMode && { fontSize: 16 }]}>
              시설관리 시스템
            </Text>
          </View>

          {/* 서버 상태 */}
          <View style={styles.serverStatus}>
            <View style={styles.serverDot} />
            <Text style={[styles.serverText, isSeniorMode && { fontSize: 14 }]}>서버 연결됨</Text>
          </View>
        </View>

        {/* 로그인 카드 */}
        <View style={styles.card}>
          {/* 에러 메시지 */}
          {displayError && (
            <View style={[styles.errorBox, isSeniorMode && { padding: 18, borderWidth: 2 }]}>
              <Text style={[styles.errorText, isSeniorMode && { fontSize: fontSize.medium }]}>
                ⚠️ {displayError}
              </Text>
            </View>
          )}

          {/* 아이디 입력 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontSize: labelSize }]}>아이디</Text>
            <View
              style={[
                styles.inputContainer,
                { height: inputHeight },
                isSeniorMode && styles.inputContainerSenior,
              ]}
            >
              <User
                size={isSeniorMode ? 26 : 22}
                color={COLORS.textSecondary as never}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  { fontSize: inputFontSize },
                  isSeniorMode && styles.inputSenior,
                ]}
                placeholder="아이디를 입력하세요"
                placeholderTextColor={COLORS.textMuted}
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontSize: labelSize }]}>비밀번호</Text>
            <View
              style={[
                styles.inputContainer,
                { height: inputHeight },
                isSeniorMode && styles.inputContainerSenior,
              ]}
            >
              <Lock
                size={isSeniorMode ? 26 : 22}
                color={COLORS.textSecondary as never}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  { fontSize: inputFontSize, paddingRight: 50 },
                  isSeniorMode && styles.inputSenior,
                ]}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <Pressable
                style={styles.showPasswordButton}
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
          </View>

          {/* 옵션 행 */}
          <View style={styles.optionsRow}>
            {/* 자동 로그인 */}
            <Pressable style={styles.checkboxContainer} onPress={() => setAutoLogin(!autoLogin)}>
              <View
                style={[
                  styles.checkbox,
                  autoLogin && styles.checkboxChecked,
                  isSeniorMode && { width: 28, height: 28 },
                ]}
              >
                {autoLogin && <Check size={isSeniorMode ? 20 : 16} color="#FFFFFF" />}
              </View>
              <Text style={[styles.checkboxLabel, isSeniorMode && { fontSize: fontSize.medium }]}>
                자동 로그인
              </Text>
            </Pressable>

            {/* 개인정보처리방침 */}
            <Pressable style={styles.privacyLink}>
              <Text style={[styles.privacyText, isSeniorMode && { fontSize: fontSize.small }]}>
                개인정보처리방침
              </Text>
            </Pressable>
          </View>

          {/* 로그인 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              { height: buttonHeight },
              pressed && styles.loginButtonPressed,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.loginButtonText, { fontSize: buttonFontSize }]}>로그인</Text>
            )}
          </Pressable>

          {/* 구분선 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, isSeniorMode && { fontSize: 16 }]}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 기간제 근로자 로그인 */}
          <Pressable
            style={({ pressed }) => [
              styles.guestButton,
              { height: buttonHeight },
              pressed && styles.guestButtonPressed,
            ]}
            onPress={() => router.push('/(auth)/guest-login')}
          >
            <Text style={[styles.guestButtonText, { fontSize: buttonFontSize }]}>
              기간제 근로자 로그인
            </Text>
          </Pressable>
        </View>

        {/* 하단 정보 */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isSeniorMode && { fontSize: 14 }]}>HDC Labs</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  serverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.serverDot,
    marginRight: 8,
  },
  serverText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputContainerSenior: {
    borderWidth: 3,
    borderRadius: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: COLORS.textPrimary,
    paddingLeft: 12,
  },
  inputSenior: {
    fontWeight: '500',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  privacyLink: {
    paddingVertical: 4,
  },
  privacyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  guestButton: {
    backgroundColor: '#E67E22',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonPressed: {
    backgroundColor: '#D35400',
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
