/**
 * Splash Screen Component
 *
 * 앱 시작 시 표시되는 스플래시 화면
 * - HDC Insite 로고 표시
 * - 로딩 인디케이터
 * - 중앙 정렬 레이아웃
 */
import { YStack, Text, Spinner } from 'tamagui';
import { APP_NAME } from '@/constants/config';

interface SplashScreenProps {
  /**
   * 로딩 메시지 표시 여부
   * @default false
   */
  showMessage?: boolean;
  /**
   * 커스텀 로딩 메시지
   * @default "앱을 준비하고 있습니다..."
   */
  message?: string;
}

export function SplashScreen({
  showMessage = false,
  message = '앱을 준비하고 있습니다...',
}: SplashScreenProps) {
  return (
    <YStack
      flex={1}
      backgroundColor="$primary"
      alignItems="center"
      justifyContent="center"
      padding="$4"
    >
      {/* 로고 영역 */}
      <YStack alignItems="center" gap="$4">
        {/* TODO: 실제 로고 이미지로 교체 */}
        <Text fontSize={48} fontWeight="bold" color="$white" textAlign="center">
          {APP_NAME}
        </Text>

        {/* 로딩 인디케이터 */}
        <Spinner size="large" color="$white" />

        {/* 로딩 메시지 (선택적) */}
        {showMessage && (
          <Text fontSize={14} color="$white" opacity={0.8} textAlign="center" marginTop="$2">
            {message}
          </Text>
        )}
      </YStack>

      {/* 하단 앱 버전 정보 */}
      <YStack position="absolute" bottom="$6">
        <Text fontSize={12} color="$white" opacity={0.6}>
          v2.0.0
        </Text>
      </YStack>
    </YStack>
  );
}
