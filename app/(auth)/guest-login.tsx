import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0064FF" />
        <Text style={[styles.loadingText, isSeniorMode && { fontSize: fontSize.medium }]}>
          NFC 초기화 중...
        </Text>
      </View>
    );
  }

  // NFC 미지원 표시
  if (isSupported === false) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, isSeniorMode && { fontSize: fontSize.title }]}>
            NFC 미지원
          </Text>
          <Text style={[styles.description, isSeniorMode && { fontSize: fontSize.medium }]}>
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>돌아가기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, isSeniorMode && { fontSize: fontSize.title }]}>{APP_NAME}</Text>
        <Text style={[styles.subtitle, isSeniorMode && { fontSize: fontSize.medium }]}>
          NFC 게스트 로그인
        </Text>

        {/* NFC 비활성화 경고 */}
        {isSupported && !isEnabled && (
          <TouchableOpacity style={styles.warningBanner} onPress={openNFCSettings}>
            <Text style={[styles.warningText, isSeniorMode && { fontSize: fontSize.small }]}>
              NFC가 비활성화되어 있습니다. 탭하여 설정 열기
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.nfcArea}>
          {isScanning || isLoading ? (
            <>
              <ActivityIndicator size="large" color="#0064FF" style={styles.spinner} />
              <Text style={[styles.scanningText, isSeniorMode && { fontSize: fontSize.large }]}>
                {isScanning ? 'NFC 태그를 스캔하세요' : '로그인 중...'}
              </Text>
              <Text style={[styles.scanningHint, isSeniorMode && { fontSize: fontSize.small }]}>
                {isScanning ? '기기 뒷면을 NFC 태그에 가까이 대주세요' : '잠시만 기다려주세요'}
              </Text>
            </>
          ) : (
            <>
              <View
                style={[
                  styles.nfcIcon,
                  isSeniorMode && { width: 160, height: 160, borderRadius: 80 },
                  !isEnabled && styles.nfcIconDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.nfcIconText,
                    isSeniorMode && { fontSize: fontSize.title },
                    !isEnabled && styles.nfcIconTextDisabled,
                  ]}
                >
                  NFC
                </Text>
              </View>
              <Text style={[styles.description, isSeniorMode && { fontSize: fontSize.medium }]}>
                NFC 태그를 스캔하여{'\n'}게스트로 로그인하세요
              </Text>
            </>
          )}
        </View>

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
              style={styles.cancelButton}
              onPress={handleCancelScan}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
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
            style={[styles.scanButton, isLoading && styles.scanButtonDisabled]}
            onPress={isEnabled ? handleStartScan : openNFCSettings}
            disabled={isLoading}
          >
            <Text style={styles.scanButtonText}>
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
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading || isScanning}
          >
            <Text
              style={[
                styles.backButtonText,
                (isLoading || isScanning) && styles.backButtonTextDisabled,
              ]}
            >
              이메일로 로그인
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
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
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6E6E6E',
  },
  warningBanner: {
    width: '100%',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
  },
  nfcArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nfcIconDisabled: {
    backgroundColor: '#F5F5F5',
  },
  nfcIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0064FF',
  },
  nfcIconTextDisabled: {
    color: '#B3B3B3',
  },
  description: {
    fontSize: 16,
    color: '#6E6E6E',
    textAlign: 'center',
    lineHeight: 24,
  },
  spinner: {
    marginBottom: 24,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  scanningHint: {
    fontSize: 14,
    color: '#6E6E6E',
    textAlign: 'center',
  },
  scanButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#0064FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonDisabled: {
    backgroundColor: '#B3B3B3',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E6E6E',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#0064FF',
  },
  backButtonTextDisabled: {
    color: '#B3B3B3',
  },
});
