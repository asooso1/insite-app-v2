/**
 * 비밀번호 변경 화면
 *
 * 초기 로그인 시 비밀번호 변경 필요 또는
 * 설정에서 비밀번호 변경 시 사용
 */

import { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';

/**
 * 비밀번호 변경 폼 스키마
 */
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요'),
    newPassword: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력하세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { changePassword, isLoading } = useChangePassword();

  // 비밀번호 표시/숨기기 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <ScrollView flex={1} backgroundColor="$white">
      <YStack flex={1} padding="$6" paddingTop="$12" gap="$6">
        {/* 헤더 */}
        <YStack gap="$2">
          <Text fontSize={28} fontWeight="700" color="$gray900">
            비밀번호 변경
          </Text>
          <Text fontSize={14} color="$gray600">
            안전한 비밀번호로 변경해주세요
          </Text>
        </YStack>

        {/* 비밀번호 규칙 안내 */}
        <YStack
          backgroundColor="#EBF4FF"
          borderRadius="$3"
          padding="$4"
          borderWidth={1}
          borderColor="#B3D7FF"
          gap="$2"
        >
          <XStack gap="$2" alignItems="center">
            <Ionicons name="information-circle" size={20} color="#0064FF" />
            <Text fontSize={14} fontWeight="600" color="#0052CC">
              비밀번호 규칙
            </Text>
          </XStack>
          <YStack gap="$1" paddingLeft="$6">
            <Text fontSize={12} color="$gray700">
              • 8자 이상
            </Text>
            <Text fontSize={12} color="$gray700">
              • 영문자 포함
            </Text>
            <Text fontSize={12} color="$gray700">
              • 숫자 포함
            </Text>
          </YStack>
        </YStack>

        {/* 폼 */}
        <YStack gap="$5">
          {/* 현재 비밀번호 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$gray900">
              현재 비밀번호
            </Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <YStack gap="$2">
                  <XStack position="relative" width="100%">
                    <Input
                      {...({
                        width: '100%',
                        height: 52,
                        placeholder: '현재 비밀번호를 입력하세요',
                        secureTextEntry: !showCurrentPassword,
                        onBlur,
                        onChangeText: onChange,
                        value,
                        borderColor: errors.currentPassword ? '#C9252D' : '#C9C9C9',
                        editable: !isLoading,
                      } as any)}
                    />
                    <Pressable
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                      }}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <Ionicons
                        name={showCurrentPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#8E8E8E"
                      />
                    </Pressable>
                  </XStack>
                </YStack>
              )}
            />
            {errors.currentPassword && (
              <Text fontSize={12} color="$error">
                {errors.currentPassword.message}
              </Text>
            )}
          </YStack>

          {/* 새 비밀번호 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$gray900">
              새 비밀번호
            </Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <YStack gap="$2">
                  <XStack position="relative" width="100%">
                    <Input
                      {...({
                        width: '100%',
                        height: 52,
                        placeholder: '새 비밀번호를 입력하세요',
                        secureTextEntry: !showNewPassword,
                        onBlur,
                        onChangeText: onChange,
                        value,
                        borderColor: errors.newPassword ? '#C9252D' : '#C9C9C9',
                        editable: !isLoading,
                      } as any)}
                    />
                    <Pressable
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                      }}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons
                        name={showNewPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#8E8E8E"
                      />
                    </Pressable>
                  </XStack>
                </YStack>
              )}
            />
            {errors.newPassword && (
              <Text fontSize={12} color="$error">
                {errors.newPassword.message}
              </Text>
            )}
          </YStack>

          {/* 새 비밀번호 확인 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color="$gray900">
              새 비밀번호 확인
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <YStack gap="$2">
                  <XStack position="relative" width="100%">
                    <Input
                      {...({
                        width: '100%',
                        height: 52,
                        placeholder: '새 비밀번호를 다시 입력하세요',
                        secureTextEntry: !showConfirmPassword,
                        onBlur,
                        onChangeText: onChange,
                        value,
                        borderColor: errors.confirmPassword ? '#C9252D' : '#C9C9C9',
                        editable: !isLoading,
                      } as any)}
                    />
                    <Pressable
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                      }}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#8E8E8E"
                      />
                    </Pressable>
                  </XStack>
                </YStack>
              )}
            />
            {errors.confirmPassword && (
              <Text fontSize={12} color="$error">
                {errors.confirmPassword.message}
              </Text>
            )}
          </YStack>
        </YStack>

        {/* 버튼 그룹 */}
        <YStack gap="$3" marginTop="$4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            loading={isLoading}
          >
            비밀번호 변경
          </Button>

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onPress={() => router.back()}
            disabled={isLoading}
          >
            취소
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
