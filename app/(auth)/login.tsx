/**
 * 로그인 화면
 *
 * 2026 Modern UI - Premium Facility Management
 * Glassmorphism + 그라디언트 기반 현대적 로그인 경험
 */
import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { styled, YStack, XStack, Text } from 'tamagui';
import { APP_NAME } from '@/constants/config';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Button } from '@/components/ui/Button';
import { TextField, PasswordField } from '@/components/ui/TextField';

const { height } = Dimensions.get('window');

// 검증 스키마
const loginSchema = z.object({
  userId: z.string().min(1, '아이디를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 앱 로고/타이틀
 */
const LogoText = styled(Text, {
  fontSize: 42,
  fontWeight: '800',
  color: '$colorInverse',
  letterSpacing: -1.5,
  textShadowColor: 'rgba(0, 102, 204, 0.3)',
  textShadowOffset: { width: 0, height: 4 },
  textShadowRadius: 12,
});

const SubtitleText = styled(Text, {
  fontSize: 16,
  color: 'rgba(255, 255, 255, 0.8)',
  marginTop: 4,
  letterSpacing: 2,
  textTransform: 'uppercase',
});

/**
 * 서버 상태 인디케이터
 */
const ServerStatus = styled(XStack, {
  alignItems: 'center',
  gap: 8,
  marginBottom: 16,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  alignSelf: 'center',
});

const ServerDot = styled(View, {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#00C853',
});

const ServerText = styled(Text, {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: '500',
});

/**
 * 에러 메시지 박스
 */
const ErrorBox = styled(XStack, {
  backgroundColor: 'rgba(239, 68, 68, 0.15)',
  borderWidth: 1,
  borderColor: 'rgba(239, 68, 68, 0.3)',
  borderRadius: 12,
  padding: 14,
  alignItems: 'center',
  gap: 10,
});

const ErrorText = styled(Text, {
  fontSize: 14,
  color: '#FCA5A5',
  flex: 1,
});

/**
 * 게스트 로그인 링크
 */
const GuestLink = styled(Text, {
  fontSize: 14,
  color: '$colorInverse',
  fontWeight: '500',
  opacity: 0.9,
});

export default function LoginScreen() {
  const { login, isLoading, error } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login({
      userId: data.userId,
      passwd: data.password,
    });
  };

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

      {/* 장식용 원형 요소들 */}
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

      <View style={styles.decorativeCircle3}>
        <LinearGradient
          colors={['rgba(0, 200, 83, 0.15)', 'rgba(105, 240, 174, 0.05)']}
          style={styles.circleGradient}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 로고 영역 */}
        <View style={styles.header}>
          <LogoText>{APP_NAME}</LogoText>
          <SubtitleText>Facility Management</SubtitleText>
        </View>

        {/* 로그인 카드 */}
        <View style={styles.cardWrapper}>
          {/* Glassmorphism 효과 */}
          <BlurView intensity={40} tint="light" style={styles.blurView}>
            <View style={styles.glassCard}>
              {/* 서버 상태 */}
              <ServerStatus>
                <ServerDot />
                <ServerText>스테이징 서버 연결됨</ServerText>
              </ServerStatus>

              {/* API 에러 */}
              {error && (
                <ErrorBox>
                  <Text fontSize={18}>!</Text>
                  <ErrorText>{error}</ErrorText>
                </ErrorBox>
              )}

              {/* 로그인 폼 */}
              <YStack gap={20}>
                {/* 아이디 입력 */}
                <Controller
                  control={control}
                  name="userId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="아이디"
                      placeholder="아이디를 입력하세요"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                      disabled={isLoading}
                      errorMessage={errors.userId?.message}
                      variant="glass"
                    />
                  )}
                />

                {/* 비밀번호 입력 */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordField
                      label="비밀번호"
                      placeholder="비밀번호를 입력하세요"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      disabled={isLoading}
                      errorMessage={errors.password?.message}
                      variant="glass"
                    />
                  )}
                />

                {/* 로그인 버튼 */}
                <YStack marginTop={8}>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    onPress={handleSubmit(onSubmit)}
                    loading={isLoading}
                    disabled={isLoading}
                    glow
                  >
                    로그인
                  </Button>
                </YStack>
              </YStack>
            </View>
          </BlurView>
        </View>

        {/* 하단 링크 */}
        <View style={styles.footer}>
          <Link href="/(auth)/guest-login" asChild>
            <XStack
              paddingVertical={12}
              paddingHorizontal={24}
              backgroundColor="rgba(255, 255, 255, 0.1)"
              borderRadius={24}
              pressStyle={{ opacity: 0.7, scale: 0.98 }}
            >
              <GuestLink>NFC 게스트 로그인</GuestLink>
            </XStack>
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
  cardWrapper: {
    flex: 1,
    maxHeight: 420,
    marginVertical: 24,
  },
  blurView: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  glassCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 28,
    gap: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  // 장식용 원형
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
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.4,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  circleGradient: {
    width: '100%',
    height: '100%',
  },
});
