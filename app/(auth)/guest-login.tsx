import { useEffect, useCallback } from 'react';
import { ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { YStack, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { APP_NAME } from '@/constants/config';
import { useGuestLogin } from '@/features/auth/hooks/useGuestLogin';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorButton } from '@/components/ui/SeniorButton';
import { useGuestNFC } from '@/hooks/useNFC';
import { showNFCDisabledAlert, showNFCNotSupportedAlert, openNFCSettings } from '@/services/nfc';

export default function GuestLoginScreen() {
  const router = useRouter();
  const { isLoading, performGuestLogin } = useGuestLogin();
  const { isSeniorMode, fontSize } = useSeniorStyles();

  const {
    isSupported,
    isEnabled,
    status,
    buildingId,
    error,
    startScan,
    cancelScan,
    reset,
    refresh,
  } = useGuestNFC({
    scanAlertMessage: '게스트 로그인을 위해 NFC 태그를 스캔해주세요',
    scanTimeout: 60000, // 60초
  });

  const isScanning = status === 'scanning';
  const isInitializing = status === 'initializing';

  /**
   * NFC 스캔 시작
   */
  const handleStartScan = useCallback(async () => {
    // NFC 비활성화 시 설정 안내
    if (isSupported && !isEnabled) {
      showNFCDisabledAlert();
      return;
    }

    // NFC 미지원 시 안내
    if (!isSupported) {
      showNFCNotSupportedAlert();
      return;
    }

    reset(); // 이전 상태 초기화

    const tag = await startScan();

    if (tag) {
      // 스캔 성공 - 게스트 로그인 실행
      try {
        // NDEF 메시지 또는 파싱된 빌딩 ID 사용
        const extractedBuildingId = tag.ndefMessage || buildingId || 'DEFAULT_BUILDING';

        await performGuestLogin({
          tagId: tag.tagId,
          buildingId: extractedBuildingId,
        });
      } catch (loginError) {
        console.error('[GuestLogin] 로그인 오류:', loginError);
        Alert.alert(
          '로그인 실패',
          '게스트 로그인에 실패했습니다.\n다시 시도해주세요.',
          [{ text: '확인' }]
        );
      }
    }
  }, [isSupported, isEnabled, reset, startScan, buildingId, performGuestLogin]);

  /**
   * NFC 스캔 취소
   */
  const handleCancelScan = useCallback(async () => {
    await cancelScan();
  }, [cancelScan]);

  /**
   * NFC 에러 처리
   */
  useEffect(() => {
    if (error && status === 'error') {
      let title = 'NFC 오류';
      let message = '알 수 없는 오류가 발생했습니다.';

      switch (error.code) {
        case 'NOT_SUPPORTED':
          title = 'NFC 미지원';
          message = '이 기기는 NFC를 지원하지 않습니다.';
          break;
        case 'NOT_ENABLED':
          title = 'NFC 비활성화';
          message = 'NFC가 비활성화되어 있습니다.\n설정에서 NFC를 켜주세요.';
          break;
        case 'TIMEOUT':
          title = '스캔 시간 초과';
          message = 'NFC 스캔 시간이 초과되었습니다.\n다시 시도해주세요.';
          break;
        case 'TAG_LOST':
          title = '태그 읽기 실패';
          message = 'NFC 태그를 읽을 수 없습니다.\n태그를 다시 스캔해주세요.';
          break;
        case 'CANCELLED':
          // 사용자 취소는 알림 표시 안 함
          return;
        default:
          message = error.message || '알 수 없는 오류가 발생했습니다.';
      }

      Alert.alert(title, message, [
        { text: '확인', onPress: reset },
        ...(error.code === 'NOT_ENABLED'
          ? [{ text: '설정 열기', onPress: openNFCSettings }]
          : []),
      ]);
    }
  }, [error, status, reset]);

  // 화면 진입 시 NFC 상태 새로고침
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 초기화 중 표시
  if (isInitializing) {
    return (
      <YStack flex={1} backgroundColor="$white" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#0064FF" />
        <Text
          style={{
            marginTop: 16,
            fontSize: isSeniorMode ? fontSize.medium : 14,
            color: '#6E6E6E',
          }}
        >
          NFC 초기화 중...
        </Text>
      </YStack>
    );
  }

  // NFC 미지원 표시
  if (isSupported === false) {
    return (
      <YStack flex={1} backgroundColor="$white" justifyContent="center" alignItems="center">
        <YStack
          flex={1}
          width="100%"
          paddingHorizontal={24}
          paddingTop={80}
          paddingBottom={40}
          alignItems="center"
        >
          <Text
            style={{
              fontSize: isSeniorMode ? fontSize.title : 28,
              fontWeight: '700',
              color: '#0064FF',
              marginBottom: 16,
            }}
          >
            NFC 미지원
          </Text>
          <Text
            style={{
              fontSize: isSeniorMode ? fontSize.medium : 16,
              color: '#6E6E6E',
              textAlign: 'center',
            }}
          >
            이 기기는 NFC를 지원하지 않습니다.
          </Text>
          {isSeniorMode ? (
            <SeniorButton
              label="돌아가기"
              onPress={() => router.back()}
              variant="outline"
              fullWidth
            />
          ) : (
            <TouchableOpacity
              style={{ paddingVertical: 12 }}
              onPress={() => router.back()}
            >
              <Text style={{ fontSize: 14, color: '#0064FF' }}>돌아가기</Text>
            </TouchableOpacity>
          )}
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$white" justifyContent="center" alignItems="center">
      <YStack
        flex={1}
        width="100%"
        paddingHorizontal={24}
        paddingTop={80}
        paddingBottom={40}
        alignItems="center"
      >
        <Text
          style={{
            fontSize: isSeniorMode ? fontSize.title : 32,
            fontWeight: '700',
            color: '#0064FF',
            marginBottom: 8,
          }}
        >
          {APP_NAME}
        </Text>
        <Text
          style={{
            fontSize: isSeniorMode ? fontSize.medium : 16,
            color: '#6E6E6E',
            marginBottom: 24,
          }}
        >
          NFC 게스트 로그인
        </Text>

        {/* NFC 비활성화 경고 */}
        {isSupported && !isEnabled && (
          <TouchableOpacity
            style={{
              width: '100%',
              backgroundColor: '#FFF3E0',
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
            }}
            onPress={openNFCSettings}
          >
            <Text
              style={{
                fontSize: isSeniorMode ? fontSize.small : 14,
                color: '#E65100',
                textAlign: 'center',
              }}
            >
              NFC가 비활성화되어 있습니다. 탭하여 설정 열기
            </Text>
          </TouchableOpacity>
        )}

        {/* NFC 영역 */}
        <YStack flex={1} justifyContent="center" alignItems="center">
          {isScanning || isLoading ? (
            <>
              <ActivityIndicator size="large" color="#0064FF" style={{ marginBottom: 24 }} />
              <Text
                style={{
                  fontSize: isSeniorMode ? fontSize.large : 18,
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: 8,
                }}
              >
                {isScanning ? 'NFC 태그를 스캔하세요' : '로그인 중...'}
              </Text>
              <Text
                style={{
                  fontSize: isSeniorMode ? fontSize.small : 14,
                  color: '#6E6E6E',
                  textAlign: 'center',
                }}
              >
                {isScanning ? '기기 뒷면을 NFC 태그에 가까이 대주세요' : '잠시만 기다려주세요'}
              </Text>
            </>
          ) : (
            <>
              <YStack
                width={isSeniorMode ? 160 : 120}
                height={isSeniorMode ? 160 : 120}
                borderRadius={isSeniorMode ? 80 : 60}
                backgroundColor={!isEnabled ? '#F5F5F5' : '#E6F0FF'}
                justifyContent="center"
                alignItems="center"
                marginBottom={24}
              >
                <Text
                  style={{
                    fontSize: isSeniorMode ? fontSize.title : 24,
                    fontWeight: '700',
                    color: !isEnabled ? '#B3B3B3' : '#0064FF',
                  }}
                >
                  NFC
                </Text>
              </YStack>
              <Text
                style={{
                  fontSize: isSeniorMode ? fontSize.medium : 16,
                  color: '#6E6E6E',
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                NFC 태그를 스캔하여{'\n'}게스트로 로그인하세요
              </Text>
            </>
          )}
        </YStack>

        {/* 버튼 - 시니어 모드 대응 */}
        {isScanning ? (
          isSeniorMode ? (
            <SeniorButton
              label="취소"
              onPress={handleCancelScan}
              disabled={isLoading}
              variant="outline"
              fullWidth
            />
          ) : (
            <TouchableOpacity
              style={{
                width: '100%',
                height: 48,
                backgroundColor: '#F5F5F5',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
              onPress={handleCancelScan}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6E6E6E' }}>취소</Text>
            </TouchableOpacity>
          )
        ) : isSeniorMode ? (
          <SeniorButton
            label={isEnabled ? 'NFC 스캔 시작' : 'NFC 설정 열기'}
            onPress={isEnabled ? handleStartScan : openNFCSettings}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        ) : (
          <TouchableOpacity
            style={{
              width: '100%',
              height: 48,
              backgroundColor: isLoading ? '#B3B3B3' : '#0064FF',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
            onPress={isEnabled ? handleStartScan : openNFCSettings}
            disabled={isLoading}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
              {isEnabled ? 'NFC 스캔 시작' : 'NFC 설정 열기'}
            </Text>
          </TouchableOpacity>
        )}

        {isSeniorMode ? (
          <SeniorButton
            label="이메일로 로그인"
            onPress={() => router.back()}
            disabled={isLoading || isScanning}
            variant="outline"
            fullWidth
          />
        ) : (
          <TouchableOpacity
            style={{ paddingVertical: 12 }}
            onPress={() => router.back()}
            disabled={isLoading || isScanning}
          >
            <Text
              style={{
                fontSize: 14,
                color: isLoading || isScanning ? '#B3B3B3' : '#0064FF',
              }}
            >
              이메일로 로그인
            </Text>
          </TouchableOpacity>
        )}
      </YStack>
    </YStack>
  );
}
