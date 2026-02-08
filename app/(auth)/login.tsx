import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { APP_NAME } from '@/constants/config';
import { useLogin } from '@/features/auth/hooks/useLogin';

const loginSchema = z.object({
  userId: z.string().min(1, '아이디를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

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
          {/* 서버 연결 상태 표시 */}
          <View style={styles.serverInfo}>
            <View style={styles.serverDot} />
            <Text style={styles.serverText}>스테이징 서버 연결</Text>
          </View>

          {/* API 오류 표시 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          {/* User ID Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>아이디</Text>
            <Controller
              control={control}
              name="userId"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.userId && styles.inputError]}
                  placeholder="아이디를 입력하세요"
                  placeholderTextColor="#8E8E8E"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.userId && <Text style={styles.errorText}>{errors.userId.message}</Text>}
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
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  serverText: {
    fontSize: 12,
    color: '#8E8E8E',
  },
  errorContainer: {
    backgroundColor: '#FFF2F2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorMessage: {
    fontSize: 14,
    color: '#C9252D',
    textAlign: 'center',
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
