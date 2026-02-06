import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { APP_NAME } from '@/constants/config';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await authApi.login(data);

      // Mock login for development
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = {
        id: '1',
        email: data.email,
        name: '테스트 사용자',
        role: 'worker' as const,
        siteId: 'site1',
        siteName: '테스트 현장',
      };

      setAuth(mockUser, 'mock-token', 'mock-refresh-token');
      router.replace('/(main)/(tabs)/home');
    } catch (error) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인하세요');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo & Title */}
        <View style={styles.header}>
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>시설관리 플랫폼</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="이메일을 입력하세요"
                  placeholderTextColor="#8E8E8E"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#8E8E8E"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Guest Login Link */}
        <View style={styles.footer}>
          <Link href="/(auth)/guest-login" asChild>
            <TouchableOpacity style={styles.guestButton}>
              <Text style={styles.guestButtonText}>NFC 게스트 로그인</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0064FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6E6E6E',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#C9C9C9',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2C2C2C',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#C9252D',
  },
  errorText: {
    fontSize: 12,
    color: '#C9252D',
  },
  loginButton: {
    height: 48,
    backgroundColor: '#0064FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#8E8E8E',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  guestButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  guestButtonText: {
    fontSize: 14,
    color: '#0064FF',
  },
});
