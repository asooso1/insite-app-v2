import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { APP_NAME } from '@/constants/config';
import { useGuestLogin } from '@/features/auth/hooks/useGuestLogin';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorButton } from '@/components/ui/SeniorButton';

export default function GuestLoginScreen() {
  const router = useRouter();
  const { isLoading, performGuestLogin } = useGuestLogin();
  const { isSeniorMode, fontSize } = useSeniorStyles();
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // TODO: Check NFC support
    // NfcManager.isSupported().then(setNfcSupported);
    setNfcSupported(true); // Mock for now
  }, []);

  /**
   * NFC 스캔 시작
   */
  const startNfcScan = async () => {
    setIsScanning(true);

    try {
      // TODO: Implement NFC scanning
      // ============================================================
      // NFC 라이브러리 통합 시 아래 코드로 교체:
      //
      // import NfcManager, { NfcTech } from 'react-native-nfc-manager';
      //
      // await NfcManager.requestTechnology(NfcTech.Ndef);
      // const tag = await NfcManager.getTag();
      //
      // if (!tag || !tag.id) {
      //   throw new Error('유효하지 않은 NFC 태그입니다');
      // }
      //
      // const tagId = tag.id;
      // const buildingId = extractBuildingIdFromTag(tag); // 태그에서 빌딩 ID 추출
      //
      // await performGuestLogin({
      //   tagId,
      //   buildingId,
      // });
      // ============================================================

      // Mock: 개발 중에는 더미 데이터로 테스트
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock 게스트 로그인 실행
      await performGuestLogin({
        tagId: 'MOCK_NFC_TAG_12345',
        buildingId: 'MOCK_BUILDING_001',
      });
    } catch (error) {
      console.error('[GuestLogin] NFC 스캔 오류:', error);
      Alert.alert('NFC 스캔 실패', 'NFC 태그를 읽는 데 실패했습니다.\n다시 시도해주세요.', [
        { text: '확인' },
      ]);
    } finally {
      setIsScanning(false);
      // TODO: Cancel NFC technology request
      // await NfcManager.cancelTechnologyRequest();
    }
  };

  /**
   * NFC 스캔 취소
   */
  const cancelScan = () => {
    setIsScanning(false);
    // TODO: Cancel NFC scan
    // NfcManager.cancelTechnologyRequest().catch(console.error);
  };

  if (nfcSupported === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0064FF" />
      </View>
    );
  }

  if (!nfcSupported) {
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
                ]}
              >
                <Text style={[styles.nfcIconText, isSeniorMode && { fontSize: fontSize.title }]}>
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
              onPress={cancelScan}
              disabled={isLoading}
              variant="outline"
              fullWidth
            />
          ) : (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelScan} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          )
        ) : isSeniorMode ? (
          <SeniorButton
            label="NFC 스캔 시작"
            onPress={startNfcScan}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />
        ) : (
          <TouchableOpacity
            style={[styles.scanButton, isLoading && styles.scanButtonDisabled]}
            onPress={startNfcScan}
            disabled={isLoading}
          >
            <Text style={styles.scanButtonText}>NFC 스캔 시작</Text>
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
  },
  content: {
    flex: 1,
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
    marginBottom: 48,
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
  nfcIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0064FF',
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
