import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { APP_NAME } from '@/constants/config';

export default function GuestLoginScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // TODO: Check NFC support
    // NfcManager.isSupported().then(setNfcSupported);
    setNfcSupported(true); // Mock for now
  }, []);

  const startNfcScan = async () => {
    setIsScanning(true);

    try {
      // TODO: Implement NFC scanning
      // const tag = await NfcManager.requestTechnology(NfcTech.Ndef);
      // const tagId = tag.id;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert('NFC 스캔', 'NFC 태그 스캔이 완료되었습니다 (개발 중)');
    } catch (error) {
      Alert.alert('오류', 'NFC 스캔에 실패했습니다');
    } finally {
      setIsScanning(false);
    }
  };

  const cancelScan = () => {
    setIsScanning(false);
    // TODO: Cancel NFC scan
    // NfcManager.cancelTechnologyRequest();
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
          <Text style={styles.title}>NFC 미지원</Text>
          <Text style={styles.description}>이 기기는 NFC를 지원하지 않습니다.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>NFC 게스트 로그인</Text>

        <View style={styles.nfcArea}>
          {isScanning ? (
            <>
              <ActivityIndicator size="large" color="#0064FF" style={styles.spinner} />
              <Text style={styles.scanningText}>NFC 태그를 스캔하세요</Text>
              <Text style={styles.scanningHint}>기기 뒷면을 NFC 태그에 가까이 대주세요</Text>
            </>
          ) : (
            <>
              <View style={styles.nfcIcon}>
                <Text style={styles.nfcIconText}>NFC</Text>
              </View>
              <Text style={styles.description}>
                NFC 태그를 스캔하여{'\n'}게스트로 로그인하세요
              </Text>
            </>
          )}
        </View>

        {isScanning ? (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelScan}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.scanButton} onPress={startNfcScan}>
            <Text style={styles.scanButtonText}>NFC 스캔 시작</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>이메일로 로그인</Text>
        </TouchableOpacity>
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
});
